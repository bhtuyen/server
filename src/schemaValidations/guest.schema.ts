import { Role } from '@/constants/type';
import { OrderSchema } from '@/schemaValidations/order.schema';
import z from 'zod';

export const GuestLoginBody = z
  .object({
    name: z.string().min(2).max(50),
    tableNumber: z.string().min(1).max(50),
    token: z.string()
  })
  .strict();

export type GuestLoginBodyType = z.TypeOf<typeof GuestLoginBody>;

export const GuestLoginRes = z.object({
  data: z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
    guest: z.object({
      id: z.string().uuid(),
      name: z.string(),
      role: z.enum([Role.Guest]),
      tableNumber: z.string().nullable(),
      createdAt: z.date(),
      updatedAt: z.date()
    })
  }),
  message: z.string()
});

export type GuestLoginResType = z.TypeOf<typeof GuestLoginRes>;

export const GuestCreateOrdersBody = z.array(
  z.object({
    dishId: z.string().uuid(),
    quantity: z.number()
  })
);

export type GuestCreateOrdersBodyType = z.TypeOf<typeof GuestCreateOrdersBody>;

export const GuestCreateOrdersRes = z.object({
  message: z.string(),
  data: z.array(OrderSchema)
});

export type GuestCreateOrdersResType = z.TypeOf<typeof GuestCreateOrdersRes>;

export const GuestGetOrdersRes = GuestCreateOrdersRes;

export type GuestGetOrdersResType = z.TypeOf<typeof GuestGetOrdersRes>;
