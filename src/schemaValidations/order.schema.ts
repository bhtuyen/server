import { accountDto } from '@/schemaValidations/account.schema';
import { buildReply, id, updateAndCreate } from '@/schemaValidations/common.schema';
import { dishSnapshotDto } from '@/schemaValidations/dish.schema';
import { tableDto } from '@/schemaValidations/table.schema';
import { buildSelect } from '@/utils/helpers';
import { OrderStatus } from '@prisma/client';
import z from 'zod';

const order = z
  .object({
    guestId: z.string().uuid(),
    tableNumber: z.string().trim().min(1).max(50),
    dishSnapshotId: z.string().uuid(),
    options: z.string().nullable().default(null),
    quantity: z.number().int().min(1).max(20),
    orderHandlerId: z.string().uuid().nullable(),
    status: z.nativeEnum(OrderStatus)
  })
  .merge(updateAndCreate)
  .merge(id);

/**
 * Guest schema
 */
const guest = z
  .object({
    tableNumber: z.string().trim().min(1).max(50),
    refreshToken: z.string().nullable(),
    expiredAt: z.date().nullable()
  })
  .merge(updateAndCreate)
  .merge(id);

export const guestDto = guest.pick({
  id: true,
  tableNumber: true,
  createdAt: true
});

export const orderDto = order;

export type OrderDto = z.TypeOf<typeof orderDto>;

export const orderDtoDetail = orderDto.extend({
  guest: guestDto,
  table: tableDto,
  orderHandler: accountDto.nullable(),
  dishSnapshot: dishSnapshotDto
});

export type OrderDtoDetail = z.TypeOf<typeof orderDtoDetail>;

export const updateOrder = orderDto
  .pick({
    status: true,
    quantity: true,
    options: true,
    orderHandlerId: true,
    id: true
  })
  .merge(
    z.object({
      dishId: z.string().uuid()
    })
  )
  .strict();

export type UpdateOrder = z.TypeOf<typeof updateOrder>;

export const orderDtoDetailRes = buildReply(orderDtoDetail);

export type OrderDtoDetailRes = z.TypeOf<typeof orderDtoDetailRes>;

export const selectOrderDtoDetail = buildSelect(orderDtoDetail);

export const selectOrderDto = buildSelect(orderDto);

export const ordersDtoDetailRes = buildReply(z.array(orderDtoDetail));

export type OrdersDtoDetailRes = z.TypeOf<typeof ordersDtoDetailRes>;

export const guestPayOrders = z.object({
  guestId: z.string().uuid()
});

export type GuestPayOrders = z.TypeOf<typeof guestPayOrders>;

export const createOrders = z
  .object({
    guestId: z.string().uuid(),
    orders: z.array(
      z.object({
        dishId: z.string().uuid(),
        quantity: z.number(),
        options: z.string().nullable().default(null)
      })
    )
  })
  .strict();

export type CreateOrders = z.TypeOf<typeof createOrders>;
