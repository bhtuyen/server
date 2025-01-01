import { DishCategory, OrderStatus } from '@prisma/client';

import type { CreateTable, UpdateTable } from '@/schemaValidations/table.schema';

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
  getTableDetail = (id: string) => {
    return prisma.table.findUniqueOrThrow({
      where: {
        id
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
      if (isPrismaClientKnownRequestError(error) && error.code === 'P2002') {
        throw new EntityError([
          {
            message: 'Số bàn này đã tồn tại',
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
  updateTable = ({ id, ...data }: UpdateTable) => {
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
    return prisma.table.update({
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
      (order) => order.token === table.token && order.status != OrderStatus.Rejected && order.dishSnapshot.category !== DishCategory.Buffet
    );
    table.guests = table.guests.filter((guest) => guest.token === table.token);

    return table;
  };
}
export default new TableController();
