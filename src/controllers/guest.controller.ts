import envConfig from '@/config';
import prisma from '@/database';
import type { Period } from '@/schemaValidations/common.schema';
import { selectDishDto } from '@/schemaValidations/dish.schema';
import {
  selectGuestDto,
  type CreateGuest,
  type GuestCreateOrder,
  type GuestLogin
} from '@/schemaValidations/guest.schema';
import { selectOrderDtoDetail } from '@/schemaValidations/order.schema';
import type { TokenPayload } from '@/types/jwt.types';
import { AuthError } from '@/utils/errors';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '@/utils/jwt';
import { DishStatus, OrderStatus, Role, TableStatus } from '@prisma/client';
import ms from 'ms';

/**
 * @description Guest login
 * @param body
 * @returns
 * @buihuytuyen
 */
export const guestLogin = async (body: GuestLogin) => {
  const table = await prisma.table.findUnique({
    where: {
      number: body.tableNumber,
      token: body.token
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
      tableNumber: body.tableNumber
    },
    select: selectGuestDto
  });
  const refreshToken = signRefreshToken(
    {
      userId: guest.id,
      role: Role.Guest
    },
    {
      expiresIn: ms(envConfig.GUEST_REFRESH_TOKEN_EXPIRES_IN)
    }
  );
  const accessToken = signAccessToken(
    {
      userId: guest.id,
      role: Role.Guest
    },
    {
      expiresIn: ms(envConfig.GUEST_ACCESS_TOKEN_EXPIRES_IN)
    }
  );
  const decodedRefreshToken = verifyRefreshToken(refreshToken);
  const refreshTokenExpiresAt = new Date(decodedRefreshToken.exp * 1000);

  await prisma.guest.update({
    where: {
      id: guest.id
    },
    data: {
      refreshToken,
      refreshTokenExpiresAt
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
export const guestLogout = async (id: string) => {
  await prisma.guest.update({
    where: {
      id
    },
    data: {
      refreshToken: null,
      refreshTokenExpiresAt: null
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
export const guestRefreshToken = async (refreshToken: string) => {
  let decodedRefreshToken: TokenPayload;
  try {
    decodedRefreshToken = verifyRefreshToken(refreshToken);
  } catch (error) {
    throw new AuthError('Refresh token không hợp lệ');
  }
  const newRefreshToken = signRefreshToken({
    userId: decodedRefreshToken.userId,
    role: Role.Guest,
    exp: decodedRefreshToken.exp
  });
  const newAccessToken = signAccessToken(
    {
      userId: decodedRefreshToken.userId,
      role: Role.Guest
    },
    {
      expiresIn: ms(envConfig.GUEST_ACCESS_TOKEN_EXPIRES_IN)
    }
  );
  await prisma.guest.update({
    where: {
      id: decodedRefreshToken.userId
    },
    data: {
      refreshToken: newRefreshToken,
      refreshTokenExpiresAt: new Date(decodedRefreshToken.exp * 1000)
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
export const guestCreateOrders = async (guestId: string, body: GuestCreateOrder) => {
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
        number: true
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
            groupId: dish.groupId,
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
            quantity: order.quantity,
            tableNumber: guest.tableNumber,
            orderHandlerId: null,
            status: OrderStatus.Pending
          },
          select: selectOrderDtoDetail
        });
        return orderRecord;
      })
    );
    return orders;
  });

  return result;
};

/**
 * @description Guest get orders
 * @param guestId
 * @returns
 * @buihuytuyen
 */
export const guestGetOrders = async (guestId: string) => {
  const orders = await prisma.order.findMany({
    where: {
      guestId
    },
    select: selectOrderDtoDetail
  });
  return orders;
};

/**
 * @description Get guest list
 * @param fromDate
 * @param toDate
 * @returns
 * @buihuytuyen
 */
export const getGuests = async ({ fromDate, toDate }: Period) => {
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

/**
 * @description Create guest
 * @param body
 * @returns
 * @buihuytuyen
 */
export const createGuest = async (body: CreateGuest) => {
  const table = await prisma.table.findUnique({
    where: {
      number: body.tableNumber
    }
  });
  if (!table) {
    throw new Error('Bàn không tồn tại');
  }

  if (table.status === TableStatus.Hidden) {
    throw new Error(`Bàn ${table.number} đã bị ẩn, vui lòng chọn bàn khác`);
  }
  const guest = await prisma.guest.create({
    data: body,
    select: selectGuestDto
  });
  return guest;
};
