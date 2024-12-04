import { DishCategory, DishStatus } from '@prisma/client';
import z from 'zod';

export const dishSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  price: z.coerce.number().nullable().optional(),
  description: z.string().max(10000).nullable().optional(),
  category: z.enum([DishCategory.Buffet, DishCategory.Paid]),
  groupId: z.string().uuid(),
  options: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
  status: z.enum([DishStatus.Available, DishStatus.Unavailable, DishStatus.Hidden]),
  createdAt: z.date(),
  updatedAt: z.date()
});
export const dishDtoSchema = dishSchema.omit({ createdAt: true, updatedAt: true }).extend({
  groupName: z.string()
});
export const createDishSchema = dishSchema.omit({ id: true, createdAt: true, updatedAt: true });

export const updateDishSchema = dishSchema.omit({ id: true, createdAt: true, updatedAt: true });

export const dishResSchema = z.object({
  data: dishDtoSchema.nullable(),
  message: z.string().nullable()
});

export const dishesResSchema = z.object({
  data: z.array(dishDtoSchema),
  message: z.string().nullable()
});

export const dishParamsSchema = z.object({
  id: z.string().uuid()
});

/**
 *
 */
export type Dish = z.TypeOf<typeof dishSchema>;
export type DishDto = z.TypeOf<typeof dishDtoSchema>;
export type CreateDish = z.TypeOf<typeof createDishSchema>;
export type UpdateDish = z.TypeOf<typeof updateDishSchema>;
export type DishRes = z.TypeOf<typeof dishResSchema>;
export type DishesRes = z.TypeOf<typeof dishesResSchema>;
export type DishParams = z.TypeOf<typeof dishParamsSchema>;

export const DishGroupSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  code: z.string(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const DishGroupRes = z.object({
  data: DishGroupSchema,
  message: z.string()
});

export type DishGroupResType = z.TypeOf<typeof DishGroupRes>;

export const DishGroupListRes = z.object({
  data: z.array(DishGroupSchema),
  message: z.string()
});

export type DishGroupListResType = z.TypeOf<typeof DishGroupListRes>;

export const CreateDishGroupBody = z.object({
  name: z.string().min(1).max(255),
  code: z.string().min(1).max(50)
});

export type CreateDishGroupBodyType = z.TypeOf<typeof CreateDishGroupBody>;
