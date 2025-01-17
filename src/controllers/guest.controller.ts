import { DishStatus, OrderStatus, TableStatus } from '@prisma/client';
import ms from 'ms';

import type { Period } from '@/schemaValidations/common.schema';
import type { TokenPayload } from '@/types/jwt.types';

import envConfig from '@/config';
import { GuestOrderRole } from '@/constants/const';
import { prismaOptions } from '@/constants/prisma';
import prisma from '@/database';
import { selectDishDto } from '@/schemaValidations/dish.schema';
import { selectGuestDto, type GuestCreateOrders, type GuestLogin } from '@/schemaValidations/guest.schema';
import { selectOrderDtoDetail } from '@/schemaValidations/order.schema';
import { AuthError } from '@/utils/errors';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '@/utils/jwt';

class GuestController {
  /**
   * @description Guest login
   * @param body
   * @returns
   * @buihuytuyen
   */
  guestLogin = async ({ tableNumber, token }: GuestLogin) => {
    const table = await prisma.table.findUnique({
      where: {
        number: tableNumber,
        token
      }
    });
    if (!table) {
      throw new Error('Bàn không tồn tại hoặc mã token không đúng');
    }

    if (table.status === TableStatus.Hidden) {
      throw new Error('Bàn này đã bị ẩn, hãy chọn bàn khác để đăng nhập');
    }

    if (table.status === TableStatus.Reserved) {
      throw new Error('Bàn đã được đặt trước, hãy liên hệ nhân viên để được hỗ trợ');
    }

    const guest = await prisma.guest.create({
      data: {
        tableNumber,
        token
      },
      select: selectGuestDto
    });
    const refreshToken = signRefreshToken(
      {
        role: GuestOrderRole,
        tableNumber,
        tableToken: token,
        guestId: guest.id
      },
      {
        expiresIn: ms(envConfig.GUEST_REFRESH_TOKEN_EXPIRES_IN)
      }
    );
    const accessToken = signAccessToken(
      {
        role: GuestOrderRole,
        tableNumber,
        tableToken: token,
        guestId: guest.id
      },
      {
        expiresIn: ms(envConfig.GUEST_ACCESS_TOKEN_EXPIRES_IN)
      }
    );
    const decodedRefreshToken = verifyRefreshToken(refreshToken);
    const expiredAt = new Date(decodedRefreshToken.exp * 1000);

    await prisma.guest.update({
      where: {
        id: guest.id
      },
      data: {
        refreshToken,
        expiredAt
      }
    });

    return {
      guest,
      accessToken,
      refreshToken
    };
  };

  /**
   * @description Guest logout
   * @param id
   * @returns
   * @buihuytuyen
   */
  guestLogout = async (id: string) => {
    await prisma.guest.update({
      where: {
        id
      },
      data: {
        refreshToken: null,
        expiredAt: null
      }
    });
    return 'Đăng xuất thành công';
  };

  /**
   * @description Guest refresh token
   * @param refreshToken
   * @returns
   * @buihuytuyen
   */
  guestRefreshToken = async (refreshToken: string) => {
    let decodedRefreshToken: TokenPayload;
    try {
      decodedRefreshToken = verifyRefreshToken(refreshToken);
    } catch {
      throw new AuthError('Refresh token không hợp lệ');
    }
    if (decodedRefreshToken.role !== GuestOrderRole) {
      throw new AuthError('Refresh token không hợp lệ');
    }

    const { tableNumber, tableToken, guestId, exp } = decodedRefreshToken;
    const newRefreshToken = signRefreshToken({
      role: GuestOrderRole,
      tableNumber,
      tableToken,
      guestId,
      exp
    });
    const newAccessToken = signAccessToken(
      {
        role: GuestOrderRole,
        tableNumber,
        tableToken,
        guestId
      },
      {
        expiresIn: ms(envConfig.GUEST_ACCESS_TOKEN_EXPIRES_IN)
      }
    );
    await prisma.guest.update({
      where: {
        id: guestId
      },
      data: {
        refreshToken: newRefreshToken,
        expiredAt: new Date(decodedRefreshToken.exp * 1000)
      }
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    };
  };

  /**
   * @description Guest create orders
   * @param guestId
   * @param body
   * @returns
   * @buihuytuyen
   */
  guestCreateOrders = async (guestId: string, body: GuestCreateOrders) => {
    const result = await prisma.$transaction(async (tx) => {
      const guest = await tx.guest.findUniqueOrThrow({
        where: {
          id: guestId
        },
        select: {
          tableNumber: true
        }
      });

      if (guest.tableNumber === null) {
        throw new Error('Bàn của bạn đã bị xóa, vui lòng đăng xuất và đăng nhập lại một bàn mới');
      }

      const table = await tx.table.findUniqueOrThrow({
        where: {
          number: guest.tableNumber
        },
        select: {
          status: true,
          number: true,
          token: true
        }
      });

      if (table.status === TableStatus.Hidden) {
        throw new Error(`Bàn ${table.number} đã bị ẩn, vui lòng đăng xuất và chọn bàn khác`);
      }
      if (table.status === TableStatus.Reserved) {
        throw new Error(`Bàn ${table.number} đã được đặt trước, vui lòng đăng xuất và chọn bàn khác`);
      }

      const orders = await Promise.all(
        body.map(async (order) => {
          const dish = await tx.dish.findUniqueOrThrow({
            where: {
              id: order.dishId
            },
            select: selectDishDto
          });
          if (dish.status === DishStatus.Unavailable) {
            throw new Error(`Món ${dish.name} đã hết`);
          }
          if (dish.status === DishStatus.Hidden) {
            throw new Error(`Món ${dish.name} không thể đặt`);
          }
          const dishSnapshot = await tx.dishSnapshot.create({
            data: {
              description: dish.description,
              image: dish.image,
              name: dish.name,
              category: dish.category,
              options: dish.options,
              price: dish.price,
              dishId: dish.id,
              status: dish.status
            }
          });
          const orderRecord = await tx.order.create({
            data: {
              dishSnapshotId: dishSnapshot.id,
              guestId,
              token: table.token,
              quantity: order.quantity,
              tableNumber: guest.tableNumber,
              orderHandlerId: null,
              status: OrderStatus.Pending,
              options: order.options
            },
            select: selectOrderDtoDetail
          });
          return orderRecord;
        })
      );
      return orders;
    }, prismaOptions);

    return result;
  };

  /**
   * @description Get guest list
   * @param fromDate
   * @param toDate
   * @returns
   * @buihuytuyen
   */
  getGuests = async ({ fromDate, toDate }: Period) => {
    const guests = await prisma.guest.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      where: {
        createdAt: {
          gte: fromDate,
          lte: toDate
        }
      },
      select: selectGuestDto
    });
    return guests;
  };

  requestPayment = async (tableNumber: string) => {
    await prisma.table.update({
      where: {
        number: tableNumber
      },
      data: {
        requestPayment: true
      }
    });
  };

  callStaff = async (tableNumber: string) => {
    await prisma.table.update({
      where: {
        number: tableNumber
      },
      data: {
        callStaff: true
      }
    });
  };
}

export default new GuestController();
