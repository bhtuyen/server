import { DishStatus, DishCategory } from '@/constants/type';
import z from 'zod';

export const CreateDishBody = z.object({
  name: z.string().min(1).max(255),
  price: z.coerce.number().positive(),
  description: z.string().max(10000),
  category: z.enum([DishCategory.Buffet, DishCategory.Paid]),
  groupId: z.string().uuid(),
  options: z.string(),
  image: z.string().url(),
  status: z.enum([DishStatus.Available, DishStatus.Unavailable, DishStatus.Hidden])
});

export type CreateDishBodyType = z.TypeOf<typeof CreateDishBody>;

export const DishSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  price: z.coerce.number(),
  description: z.string(),
  image: z.string(),
  status: z.enum([DishStatus.Available, DishStatus.Unavailable, DishStatus.Hidden]),
  category: z.enum([DishCategory.Buffet, DishCategory.Paid]),
  groupId: z.string().uuid(),
  options: z.string(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const DishRes = z.object({
  data: DishSchema,
  message: z.string()
});

export type DishResType = z.TypeOf<typeof DishRes>;

export const DishListRes = z.object({
  data: z.array(
    DishSchema.extend({
      groupName: z.string()
    })
  ),
  message: z.string()
});

export type DishListResType = z.TypeOf<typeof DishListRes>;

export const UpdateDishBody = CreateDishBody;
export type UpdateDishBodyType = CreateDishBodyType;
export const DishParams = z.object({
  id: z.string().uuid()
});
export type DishParamsType = z.TypeOf<typeof DishParams>;

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
