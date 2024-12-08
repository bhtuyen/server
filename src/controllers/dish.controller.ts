import prisma from '@/database';
import {
  selectDishDtoDetail,
  selectDishGroupDto,
  type CreateDish,
  type CreateDishGroup,
  type UpdateDish
} from '@/schemaValidations/dish.schema';

class DishController {
  /**
   * @description Get all dishes
   * @returns
   * @buihuytuyen
   */
  getDishes = async () => {
    return await prisma.dish.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      select: selectDishDtoDetail
    });
  };

  /**
   * @description Get dish by id
   * @param id
   * @returns
   * @buihuytuyen
   */
  getDish = (id: string) => {
    return prisma.dish.findFirstOrThrow({
      where: {
        id
      },
      select: selectDishDtoDetail
    });
  };

  /**
   * @description Create dish
   * @param data
   * @returns
   * @buihuytuyen
   */
  createDish = (data: CreateDish) => {
    return prisma.dish.create({
      data,
      select: selectDishDtoDetail
    });
  };

  /**
   * @description Update dish
   * @param id
   * @param data
   * @returns
   * @buihuytuyen
   */
  updateDish = ({ id, ...data }: UpdateDish) => {
    return prisma.dish.update({
      where: {
        id
      },
      data,
      select: selectDishDtoDetail
    });
  };

  /**
   * @description Delete dish
   * @param id
   * @returns
   * @buihuytuyen
   */
  deleteDish = (id: string) => {
    return prisma.dish.delete({
      where: {
        id
      },
      select: selectDishDtoDetail
    });
  };

  /**
   * @description Get dish group list
   * @returns
   * @buihuytuyen
   */
  getDishGroupList = () => {
    return prisma.dishGroup.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      select: selectDishGroupDto
    });
  };

  /**
   * @description Create dish group
   * @param name
   * @returns
   * @buihuytuyen
   */
  createDishGroup = ({ name }: CreateDishGroup) => {
    return prisma.dishGroup.create({
      data: {
        name
      },
      select: selectDishGroupDto
    });
  };
}

export default new DishController();
