import { DishCategory, DishStatus, Prisma } from '@prisma/client';
import z from 'zod';

import { RowMode } from '@/constants/enum';
import { buildReply, id, name, updateAndCreate } from '@/schemaValidations/common.schema';
import { buildSelect } from '@/utils/helpers';

/**
 * updateMeSchema
 */
const dish = z
  .object({
    price: z.instanceof(Prisma.Decimal).or(z.number()).nullable().optional(),
    description: z.string().max(10000).nullable(),
    category: z.nativeEnum(DishCategory),
    groupId: z.string().uuid(),
    options: z.string().nullable(),
    image: z.string().nullable(),
    status: z.nativeEnum(DishStatus)
  })
  .merge(updateAndCreate)
  .merge(id)
  .merge(name);

export type Dish = z.TypeOf<typeof dish>;

const dishSnapshot = dish
  .extend({
    dishId: z.string().uuid()
  })
  .omit({
    groupId: true
  });
export const dishGroup = name
  .merge(updateAndCreate)
  .merge(id)
  .extend({
    sortOrder: z.number().int().min(0).max(1000).optional()
  });
export const dishGroupDto = dishGroup.omit({ createdAt: true, updatedAt: true });
export const dishDto = dish.omit({ createdAt: true, updatedAt: true });
export const dishDtoDetail = dishDto.extend({
  group: dishGroupDto
});
export const dishCombo = z.object({
  comboId: z.string().uuid(),
  dishId: z.string().uuid(),
  quantity: z.number().int().min(1).max(20)
});
export const dishDtoComboDetail = dishDtoDetail.extend({
  dishes: z.array(
    z.object({
      dishId: z.string().uuid(),
      dish: dishDtoDetail,
      quantity: z.number().int().min(1).max(20)
    })
  ),
  combos: z.array(
    z.object({
      comboId: z.string().uuid(),
      combo: dishDtoDetail,
      quantity: z.number().int().min(1).max(20)
    })
  )
});
export const createDishCombo = dishDto.omit({ id: true, price: true }).extend({
  dishes: z.array(z.object({ dishId: z.string().uuid(), quantity: z.number().int().min(1).max(20) })),
  combos: z.array(
    z.object({
      comboId: z.string().uuid(),
      quantity: z.number().int().min(1).max(20)
    })
  ),
  price: z.instanceof(Prisma.Decimal).or(z.number()).optional()
});
export const updateDishCombo = dishDto.extend({
  dishes: z.array(
    z.object({
      dishId: z.string().uuid(),
      quantity: z.number().int().min(1).max(20),
      rowMode: z.nativeEnum(RowMode)
    })
  ),
  combos: z.array(
    z.object({
      comboId: z.string().uuid(),
      quantity: z.number().int().min(1).max(20),
      rowMode: z.nativeEnum(RowMode)
    })
  )
});
export const dishSnapshotDto = dishSnapshot.omit({ createdAt: true, updatedAt: true });
export const createDishGroup = dishGroupDto.pick({ name: true });
export const dishToChoose = z.object({
  categories: z.array(z.nativeEnum(DishCategory)),
  ignores: z.array(z.string().uuid())
});
export const dishDtoDetailChoose = dishDtoDetail.extend({
  quantity: z.number().int().min(1).max(20)
});
export const dishRes = buildReply(dishDtoDetail);
export const dishesRes = buildReply(z.array(dishDtoDetail));
export const dishGroupRes = buildReply(dishGroupDto);
export const dishGroupsRes = buildReply(z.array(dishGroupDto));
export const dishDtoComboDetailRes = buildReply(dishDtoComboDetail);
export const dishDtoComboDetailsRes = buildReply(z.array(dishDtoComboDetail));
export const dishDtoDetailChooseRes = buildReply(z.array(dishDtoDetailChoose));
export const selectDishDto = buildSelect(dishDto);
export const selectDishGroupDto = buildSelect(dishGroupDto);
export const selectDishDtoDetail = buildSelect(dishDtoDetail);
export const selectDishDtoComboDetail = buildSelect(dishDtoComboDetail);

/**
 * Type
 */
export type DishRes = z.TypeOf<typeof dishRes>;
export type DishCombo = z.TypeOf<typeof dishCombo>;
export type DishesRes = z.TypeOf<typeof dishesRes>;
export type DishGroupRes = z.TypeOf<typeof dishGroupRes>;
export type DishToChoose = z.TypeOf<typeof dishToChoose>;
export type DishGroupsRes = z.TypeOf<typeof dishGroupsRes>;
export type CreateDishGroup = z.TypeOf<typeof createDishGroup>;
export type CreateDishCombo = z.TypeOf<typeof createDishCombo>;
export type UpdateDishCombo = z.TypeOf<typeof updateDishCombo>;
export type DishDtoComboDetailRes = z.TypeOf<typeof dishDtoComboDetailRes>;
export type DishDtoComboDetailsRes = z.TypeOf<typeof dishDtoComboDetailsRes>;
export type DishDtoDetailChooseRes = z.TypeOf<typeof dishDtoDetailChooseRes>;
