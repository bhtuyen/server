import z from 'zod';

import { token } from '@/schemaValidations/auth.schema';
import { buildReply } from '@/schemaValidations/common.schema';
import { guestDto } from '@/schemaValidations/order.schema';
import { buildSelect } from '@/utils/helpers';

export const guestLogin = guestDto.pick({ tableNumber: true, token: true });
export const guestCreateOrders = z.array(
  z.object({
    dishId: z.string().uuid(),
    quantity: z.number().min(1).max(20),
    options: z.string().nullable()
  })
);
export const guestsRes = buildReply(z.array(guestDto));
export const guestLoginRes = buildReply(
  z
    .object({
      guest: guestDto
    })
    .merge(token)
);
export const selectGuestDto = buildSelect(guestDto);

export const requestPayment = z.object({
  tableNumber: z.string()
});

export const callStaff = z.object({
  tableNumber: z.string()
});

export type GuestDto = z.TypeOf<typeof guestDto>;
export type GuestsRes = z.TypeOf<typeof guestsRes>;
export type GuestLogin = z.TypeOf<typeof guestLogin>;
export type GuestLoginRes = z.TypeOf<typeof guestLoginRes>;
export type GuestCreateOrders = z.TypeOf<typeof guestCreateOrders>;
export type CallStaff = z.TypeOf<typeof callStaff>;
export type RequestPayment = z.TypeOf<typeof requestPayment>;
