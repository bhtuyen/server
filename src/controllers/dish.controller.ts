import prisma from '@/database';
import { selectDish, type CreateDish, type CreateDishGroup, type UpdateDish } from '@/schemaValidations/dish.schema';

const select = {
  id: true,
  name: true,
  price: true,
  group: {
    select: {
      name: true
    }
  },
  groupId: true,
  category: true,
  options: true,
  description: true,
  image: true,
  status: true
};

export const getDishes = async () => {
  return await prisma.dish.findMany({
    orderBy: {
      createdAt: 'desc'
    },
    select: selectDish
  });
};

export const getDish = (id: string) => {
  return prisma.dish.findFirstOrThrow({
    where: {
      id
    },
    select: selectDish
  });
};

export const createDish = (data: CreateDish) => {
  return prisma.dish.create({
    data,
    select: selectDish
  });
};

export const updateDish = (id: string, data: UpdateDish) => {
  return prisma.dish.update({
    where: {
      id
    },
    data,
    select: selectDish
  });
};

export const deleteDish = (id: string) => {
  return prisma.dish.delete({
    where: {
      id
    },
    select: selectDish
  });
};

export const getDishGroupList = () => {
  return prisma.dishGroup.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  });
};

export const createDishGroup = ({ name }: CreateDishGroup) => {
  return prisma.dishGroup.create({
    data: {
      name
    }
  });
};
