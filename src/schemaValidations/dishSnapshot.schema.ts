import { dish } from '@/schemaValidations/dish.schema';
import z from 'zod';

const dishSnapshot = dish.extend({
  dishId: z.string().uuid()
});

export const dishSnapshotDto = dishSnapshot.omit({ createdAt: true, updatedAt: true });

export type DishSnapshotDto = z.TypeOf<typeof dishSnapshotDto>;
