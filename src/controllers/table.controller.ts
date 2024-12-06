import prisma from '@/database';
import { selectTableDto, type CreateTable, type UpdateTable } from '@/schemaValidations/table.schema';
import { EntityError, isPrismaClientKnownRequestError } from '@/utils/errors';
import { randomId } from '@/utils/helpers';

/**
 * @description Get all tables
 * @returns
 * @buihuytuyen
 */
export const getTableList = () => {
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
export const getTableDetail = (number: string) => {
  return prisma.table.findUniqueOrThrow({
    where: {
      number
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
export const createTable = async (data: CreateTable) => {
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
export const updateTable = (number: string, data: UpdateTable) => {
  if (data.changeToken) {
    const token = randomId();
    // Xóa hết các refresh token của guest theo table
    return prisma.$transaction(async (tx) => {
      const [table] = await Promise.all([
        tx.table.update({
          where: {
            number
          },
          data: {
            status: data.status,
            capacity: data.capacity,
            token
          },
          select: selectTableDto
        }),
        tx.guest.updateMany({
          where: {
            tableNumber: number
          },
          data: {
            refreshToken: null,
            refreshTokenExpiresAt: null
          }
        })
      ]);
      return table;
    });
  }
  return prisma.table.update({
    where: {
      number
    },
    data: {
      status: data.status,
      capacity: data.capacity
    },
    select: selectTableDto
  });
};

/**
 * @description Delete table
 * @param number
 * @returns
 * @buihuytuyen
 */
export const deleteTable = (number: string) => {
  return prisma.table.delete({
    where: {
      number
    },
    select: selectTableDto
  });
};
