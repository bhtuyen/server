import { token } from '@/schemaValidations/auth.schema';
import { buildReply, id, updateAndCreate } from '@/schemaValidations/common.schema';
import { orderDtoDetail } from '@/schemaValidations/order.schema';
import z from 'zod';

/**
 * Guest schema
 */
export const guest = z
  .object({
    tableNumber: z.string().trim().min(1).max(50),
    refreshToken: z.string().nullable(),
    refreshTokenExpiresAt: z.date().nullable()
  })
  .merge(updateAndCreate)
  .merge(id);

export const guestDto = guest.pick({
  id: true,
  tableNumber: true
});

/**
 * Guest login
 */
export const guestLogin = guestDto
  .pick({ tableNumber: true })
  .extend({
    token: z.string()
  })
  .strict();

export const guestLoginRes = buildReply(
  z
    .object({
      guest: guestDto
    })
    .merge(token)
);
export type GuestLogin = z.TypeOf<typeof guestLogin>;
export type GuestLoginRes = z.TypeOf<typeof guestLoginRes>;

/**
 * Guest create order
 */
export const guestCreateOrder = z.array(
  z.object({
    dishId: z.string().uuid(),
    quantity: z.number().min(1).max(20),
    options: z.string().nullable().default(null)
  })
);
export const guestCreateOrderRes = buildReply(z.array(orderDtoDetail));

export type GuestCreateOrder = z.TypeOf<typeof guestCreateOrder>;
export type GuestCreateOrderRes = z.TypeOf<typeof guestCreateOrderRes>;
