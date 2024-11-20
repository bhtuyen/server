import prisma from '@/database';
import { CreateDishBodyType, CreateDishGroupBodyType, UpdateDishBodyType } from '@/schemaValidations/dish.schema';

export const getDishList = async () => {
  const resutl = await prisma.dish.findMany({
    include: {
      group: {
        select: {
          name: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return resutl.map((dish) => {
    return {
      ...dish,
      groupName: dish.group.name
    };
  });
};

export const getDishGroupList = () => {
  return prisma.dishGroup.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  });
};

export const createDishGroup = ({ name, code }: CreateDishGroupBodyType) => {
  return prisma.dishGroup.create({
    data: {
      name,
      code
    }
  });
};

export const getDishDetail = (id: string) => {
  return prisma.dish.findUniqueOrThrow({
    where: {
      id
    }
  });
};

export const createDish = (data: CreateDishBodyType) => {
  return prisma.dish.create({
    data
  });
};

export const updateDish = (id: string, data: UpdateDishBodyType) => {
  return prisma.dish.update({
    where: {
      id
    },
    data
  });
};

export const deleteDish = (id: string) => {
  return prisma.dish.delete({
    where: {
      id
    }
  });
};
