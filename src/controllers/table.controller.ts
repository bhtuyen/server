import prisma from '@/database';
import { selectTableDto, type CreateTable, type UpdateTable } from '@/schemaValidations/table.schema';
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
              refreshTokenExpiresAt: null
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
        capacity: data.capacity
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
}
export default new TableController();
