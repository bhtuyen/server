import { DishCategory } from '@prisma/client';

import type { CreateDishCombo, DishCombo, UpdateDishCombo, CreateDishGroup, DishToChoose } from '@/schemaValidations/dish.schema';

import { RowMode } from '@/constants/enum';
import prisma from '@/database';
import { selectDishDtoComboDetail, selectDishDtoDetail, selectDishGroupDto } from '@/schemaValidations/dish.schema';

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
   * @description Get dishes by category
   * @param category
   * @returns
   * @buihuytuyen
   */
  getToChoose = async ({ categories, ignores = [] }: DishToChoose) => {
    const dishes = await prisma.dish.findMany({
      where: {
        category: {
          in: categories
        },
        NOT: {
          id: {
            in: ignores
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: selectDishDtoDetail
    });

    return dishes.map((dish) => ({
      ...dish,
      quantity: 1
    }));
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
      select: selectDishDtoComboDetail
    });
  };

  /**
   * @description Create dish
   * @param data
   * @returns
   * @buihuytuyen
   */
  createDish = async ({ dishes, combos, ...data }: CreateDishCombo) => {
    const { id } = await prisma.dish.create({
      data
    });

    let dishCombo: DishCombo[] = [];

    switch (data.category) {
      case DishCategory.Buffet:
      case DishCategory.Paid:
        if (combos.length > 0) {
          dishCombo = combos.map<DishCombo>(({ comboId, quantity }) => {
            return {
              comboId,
              quantity,
              dishId: id
            };
          });
        }
        break;
      case DishCategory.ComboBuffet:
      case DishCategory.ComboPaid:
        if (dishes.length > 0) {
          dishCombo = dishes.map<DishCombo>(({ dishId, quantity }) => {
            return {
              dishId,
              quantity,
              comboId: id
            };
          });
        }
        break;
    }
    if (dishCombo.length > 0) {
      await prisma.dishCombo.createMany({
        data: dishCombo
      });
    }

    return await this.getDish(id);
  };

  /**
   * @description Update dish
   * @param id
   * @param data
   * @returns
   * @buihuytuyen
   */
  updateDish = async ({ dishes, combos, id, ...data }: UpdateDishCombo) => {
    const dishCombosInsert: DishCombo[] = [];
    const dishCombosDelete: DishCombo[] = [];
    const dishCombosUpdate: DishCombo[] = [];

    switch (data.category) {
      case DishCategory.Buffet:
      case DishCategory.Paid:
        combos.forEach(({ comboId, quantity, rowMode }) => {
          switch (rowMode) {
            case RowMode.Insert:
              dishCombosInsert.push({
                comboId,
                quantity,
                dishId: id
              });
              break;
            case RowMode.Delete:
              dishCombosDelete.push({
                comboId,
                quantity,
                dishId: id
              });
              break;
            case RowMode.Update:
              dishCombosUpdate.push({
                comboId,
                quantity,
                dishId: id
              });
              break;
          }
        });
        break;
      case DishCategory.ComboBuffet:
      case DishCategory.ComboPaid:
        dishes.forEach(({ dishId, quantity, rowMode }) => {
          switch (rowMode) {
            case RowMode.Insert:
              dishCombosInsert.push({
                dishId,
                quantity,
                comboId: id
              });
              break;
            case RowMode.Delete:
              dishCombosDelete.push({
                dishId,
                quantity,
                comboId: id
              });
              break;
            case RowMode.Update:
              dishCombosUpdate.push({
                dishId,
                quantity,
                comboId: id
              });
              break;
          }
        });
        break;
    }

    await prisma.$transaction(async (tx) => {
      const taskDeleteMany = dishCombosDelete.map(({ comboId, dishId }) =>
        prisma.dishCombo.delete({
          where: {
            dishId_comboId: {
              comboId,
              dishId
            }
          }
        })
      );

      await Promise.all(taskDeleteMany);

      const taskUpdate = prisma.dish.update({
        where: {
          id
        },
        data
      });

      const taskCreateMany = prisma.dishCombo.createMany({
        data: dishCombosInsert
      });

      const updateManyTask = dishCombosUpdate.map(({ comboId, dishId, quantity }) =>
        prisma.dishCombo.update({
          where: {
            dishId_comboId: {
              comboId,
              dishId
            }
          },
          data: {
            quantity
          }
        })
      );

      await Promise.all([taskUpdate, taskCreateMany, ...updateManyTask]);
    });

    return await prisma.dish.findFirstOrThrow({
      where: {
        id
      },
      select: selectDishDtoComboDetail
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
