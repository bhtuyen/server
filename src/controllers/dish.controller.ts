import { DishCategory } from '@prisma/client';

import type { CreateDishCombo, DishCombo, UpdateDishCombo, CreateDishGroup, DishToChoose } from '@/schemaValidations/dish.schema';

import { RowMode } from '@/constants/enum';
import { prismaOptions } from '@/constants/prisma';
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
      orderBy: [
        {
          group: {
            name: 'asc'
          }
        },
        {
          name: 'asc'
        },
        {
          createdAt: 'desc'
        }
      ],
      select: selectDishDtoDetail
    });
  };

  /**
   * @description Get dishes by category
   * @param category
   * @returns
   * @buihuytuyen
   */
  getToChoose = async ({ categories, ignores = [], comboBuffetId }: DishToChoose) => {
    const where = {
      category: {
        in: categories
      },
      NOT: {
        id: {
          in: ignores
        }
      }
    } as any;

    if (comboBuffetId) {
      where.combos = {
        some: {
          comboId: comboBuffetId
        }
      };
    }

    const dishes = await prisma.dish.findMany({
      where,
      orderBy: [
        {
          group: {
            name: 'asc'
          }
        },
        {
          name: 'asc'
        },
        {
          createdAt: 'desc'
        }
      ],
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
   * @description Get dish to order
   * @returns
   * @buihuytuyen
   */
  getDishToOrder = async () => {
    return await prisma.dish.findMany({
      where: {
        category: {
          in: [DishCategory.ComboBuffet, DishCategory.ComboPaid, DishCategory.Paid]
        }
      },
      orderBy: [
        {
          group: {
            sortOrder: 'asc'
          }
        },
        {
          price: 'asc'
        }
      ],

      select: selectDishDtoComboDetail
    });
  };

  /**
   *
   * @param dishBuffetId
   * @returns
   */
  getDishBuffet = async (dishBuffetId: string) => {
    return await prisma.dish.findMany({
      where: {
        category: DishCategory.Buffet,
        combos: {
          some: {
            comboId: dishBuffetId
          }
        }
      },
      orderBy: [
        {
          group: {
            sortOrder: 'asc'
          }
        },
        {
          price: 'asc'
        }
      ],

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
    const id = await prisma.$transaction(async (tx) => {
      const { id } = await tx.dish.create({
        data: {
          ...data,
          price: data.price ?? null
        }
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
        await tx.dishCombo.createMany({
          data: dishCombo
        });
      }
      return id;
    }, prismaOptions);

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
      if (dishCombosDelete.length > 0) {
        await Promise.all(
          dishCombosDelete.map(({ comboId, dishId }) =>
            tx.dishCombo.delete({
              where: {
                dishId_comboId: {
                  comboId,
                  dishId
                }
              }
            })
          )
        );
      }

      await tx.dish.update({
        where: {
          id
        },
        data: {
          ...data,
          price: data.price ?? null
        }
      });

      if (dishCombosInsert.length > 0) {
        await tx.dishCombo.createMany({
          data: dishCombosInsert
        });
      }

      if (dishCombosUpdate.length > 0) {
        await Promise.all(
          dishCombosUpdate.map(({ comboId, dishId, quantity }) =>
            tx.dishCombo.update({
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
          )
        );
      }
    }, prismaOptions);

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
        sortOrder: 'asc'
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
