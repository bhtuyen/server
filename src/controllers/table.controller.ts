import { DishCategory, OrderStatus, PaymentStatus } from '@prisma/client';

import type { CreateTable, UpdateTable, ModeBuffet } from '@/schemaValidations/table.schema';

import { PrismaErrorCode } from '@/constants/error-reference';
import prisma from '@/database';
import { selectTableDtoDetail } from '@/schemaValidations/order.schema';
import { selectTableDto } from '@/schemaValidations/table.schema';
import { EntityError, isPrismaClientKnownRequestError } from '@/utils/errors';
import { randomId } from '@/utils/helpers';

class TableController {
  /**
   * @description Get all tables
   * @returns
   * @buihuytuyen
   */
  getTableList = () => {
    return prisma.table.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      select: selectTableDto
    });
  };

  /**
   * @description Get table by number
   * @param number
   * @returns
   * @buihuytuyen
   */
  getTableDetail = (idOrNumber: string) => {
    return prisma.table.findMany({
      where: {
        OR: [
          {
            id: {
              equals: idOrNumber
            }
          },
          {
            number: {
              equals: idOrNumber
            }
          }
        ]
      },
      select: selectTableDto
    });
  };

  /**
   * @description Create table
   * @param data
   * @returns
   * @buihuytuyen
   */
  createTable = async (data: CreateTable) => {
    const token = randomId();
    try {
      const result = await prisma.table.create({
        data: {
          ...data,
          token
        },
        select: selectTableDto
      });
      return result;
    } catch (error) {
      if (isPrismaClientKnownRequestError(error) && error.code === PrismaErrorCode.UniqueConstraintViolation) {
        throw new EntityError([
          {
            message: 'table-number-exist',
            field: 'number'
          }
        ]);
      }
      throw error;
    }
  };

  /**
   * @description Update table
   * @param number
   * @param data
   * @returns
   * @buihuytuyen
   */
  updateTable = async ({ id, ...data }: UpdateTable) => {
    try {
      if (data.changeToken) {
        const token = randomId();
        // Xóa hết các refresh token của guest theo table
        return prisma.$transaction(async (tx) => {
          const [table] = await Promise.all([
            tx.table.update({
              where: {
                id
              },
              data: {
                status: data.status,
                capacity: data.capacity,
                number: data.number,
                token
              },
              select: selectTableDto
            }),
            tx.guest.updateMany({
              where: {
                id
              },
              data: {
                refreshToken: null,
                expiredAt: null
              }
            })
          ]);
          return table;
        });
      }
      const result = await prisma.table.update({
        where: {
          id
        },
        data: {
          status: data.status,
          capacity: data.capacity,
          number: data.number
        },
        select: selectTableDto
      });

      return result;
    } catch (error) {
      if (isPrismaClientKnownRequestError(error) && error.code === PrismaErrorCode.UniqueConstraintViolation) {
        throw new EntityError([
          {
            message: 'table-number-exist',
            field: 'number'
          }
        ]);
      }
      throw error;
    }
  };

  /**
   * @description Delete table
   * @param id
   * @returns
   * @buihuytuyen
   */
  deleteTable = (id: string) => {
    return prisma.table.delete({
      where: {
        id
      },
      select: selectTableDto
    });
  };

  /**
   * @description Get tables detail now
   * @returns
   * @buihuytuyen
   */
  getTablesDetailNow = async () => {
    const tables = await prisma.table.findMany({
      select: selectTableDtoDetail,
      orderBy: {
        number: 'asc'
      }
    });

    tables.forEach((table) => {
      table.orders = table.orders.filter((order) => order.token === table.token);
      table.guests = table.guests.filter((guest) => guest.token === table.token);
    });

    return tables;
  };

  /**
   * @description Get table detail now
   * @param tableNumber
   * @returns
   * @buihuytuyen
   */
  getTableDetailNow = async (tableNumber: string) => {
    const table = await prisma.table.findFirstOrThrow({
      select: selectTableDtoDetail,
      orderBy: {
        number: 'asc'
      },
      where: {
        number: tableNumber
      }
    });

    table.orders = table.orders.filter((order) => order.token === table.token);
    table.guests = table.guests.filter((guest) => guest.token === table.token);

    return table;
  };

  /**
   * @description Get table detail payment
   * @param tableNumber
   * @returns
   * @buihuytuyen
   */
  getTableDetailPayment = async (tableNumber: string) => {
    const table = await prisma.table.findFirstOrThrow({
      select: selectTableDtoDetail,
      orderBy: {
        number: 'asc'
      },
      where: {
        number: tableNumber
      }
    });

    table.orders = table.orders.filter(
      (order) => order.token === table.token && order.status == OrderStatus.Delivered && order.dishSnapshot.category !== DishCategory.Buffet
    );
    table.guests = table.guests.filter((guest) => guest.token === table.token);

    return table;
  };

  /**
   *
   * @param tableNumber
   * @param dishBuffetId
   * @returns
   */
  updateBuffetMode = async ({ tableNumber, dishBuffetId }: ModeBuffet) => {
    const { token } = await prisma.table.findFirstOrThrow({
      where: {
        number: tableNumber
      }
    });

    const table = await prisma.table.update({
      where: {
        number: tableNumber
      },
      data: {
        dishBuffetId
      },
      select: selectTableDto
    });

    const guestOfTable = await prisma.guest.findMany({
      where: {
        tableNumber,
        token
      }
    });

    const sockets = await prisma.socket.findMany({
      where: {
        guestId: {
          in: guestOfTable.map((guest) => guest.id)
        }
      }
    });

    return {
      table,
      socketIds: sockets.map(({ socketId }) => socketId),
      dishBuffetId
    };
  };

  resetTable = async (tableNumber: string) => {
    const token = randomId();
    await prisma.table.update({
      where: {
        number: tableNumber
      },
      data: {
        token,
        dishBuffetId: null,
        paymentStatus: PaymentStatus.Unpaid,
        callStaff: false,
        requestPayment: false
      },
      select: selectTableDto
    });
    return true;
  };
}
export default new TableController();
