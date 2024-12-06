import prisma from '@/database';
import {
  selectDishDtoDetail,
  selectDishGroupDto,
  type CreateDish,
  type CreateDishGroup,
  type UpdateDish
} from '@/schemaValidations/dish.schema';

/**
 * @description Get all dishes
 * @returns
 * @buihuytuyen
 */
export const getDishes = async () => {
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
export const getDish = (id: string) => {
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
export const createDish = (data: CreateDish) => {
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
export const updateDish = (id: string, data: UpdateDish) => {
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
export const deleteDish = (id: string) => {
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
export const getDishGroupList = () => {
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
export const createDishGroup = ({ name }: CreateDishGroup) => {
  return prisma.dishGroup.create({
    data: {
      name
    },
    select: selectDishGroupDto
  });
};
