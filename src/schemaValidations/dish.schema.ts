import { buildReply, id, name, updateAndCreate } from '@/schemaValidations/common.schema';
import { buildSelect } from '@/utils/helpers';
import { DishCategory, DishStatus, Prisma } from '@prisma/client';
import z from 'zod';

/**
 * updateMeSchema
 */
const dish = z
  .object({
    price: z.instanceof(Prisma.Decimal).or(z.number()).nullable().default(new Prisma.Decimal(0)),
    description: z.string().max(10000).nullable().default(null),
    category: z.nativeEnum(DishCategory).default(DishCategory.Paid),
    groupId: z.string().uuid(),
    options: z.string().nullable().default(null),
    image: z.string().nullable().default(null),
    status: z.nativeEnum(DishStatus).default(DishStatus.Available)
  })
  .merge(updateAndCreate)
  .merge(id)
  .merge(name);

const dishSnapshot = dish.extend({
  dishId: z.string().uuid()
});

export const dishGroup = name.merge(updateAndCreate).merge(id);
export const dishGroupDto = dishGroup.omit({ createdAt: true, updatedAt: true });
export const dishDto = dish.omit({ createdAt: true, updatedAt: true });
export const dishDtoDetail = dishDto.extend({
  group: dishGroupDto
});
export const createDish = dishDto.omit({ id: true });
export const updateDish = dishDto;
export const dishRes = buildReply(dishDtoDetail);
export const dishesRes = buildReply(z.array(dishDtoDetail));
export const dishParams = dishDtoDetail.pick({ id: true });
export const dishGroupRes = buildReply(dishGroupDto);
export const dishGroupsRes = buildReply(z.array(dishGroupDto));
export const createDishGroup = dishGroupDto.pick({ name: true });
export const selectDishDtoDetail = buildSelect(dishDtoDetail);

export const selectDishDto = buildSelect(dishDto);

export const selectDishGroupDto = buildSelect(dishGroupDto);

export const dishSnapshotDto = dishSnapshot.omit({ createdAt: true, updatedAt: true });

/**
 * Type
 */
export type DishDtoDetail = z.TypeOf<typeof dishDtoDetail>;
export type CreateDish = z.TypeOf<typeof createDish>;
export type UpdateDish = z.TypeOf<typeof updateDish>;
export type DishRes = z.TypeOf<typeof dishRes>;
export type DishesRes = z.TypeOf<typeof dishesRes>;
export type DishGroupRes = z.TypeOf<typeof dishGroupRes>;
export type DishGroupsRes = z.TypeOf<typeof dishGroupsRes>;
export type CreateDishGroup = z.TypeOf<typeof createDishGroup>;
export type DishDto = z.TypeOf<typeof dishDto>;

export type DishGroupDto = z.TypeOf<typeof dishGroupDto>;
