import { OrderStatus } from '@prisma/client';
import z from 'zod';

import { accountDto } from '@/schemaValidations/account.schema';
import { buildReply, id, updateAndCreate } from '@/schemaValidations/common.schema';
import { dishSnapshotDto } from '@/schemaValidations/dish.schema';
import { tableDto } from '@/schemaValidations/table.schema';
import { buildSelect } from '@/utils/helpers';

const guest = z
  .object({
    tableNumber: z.string().trim().min(1).max(50),
    token: z.string(),
    refreshToken: z.string().nullable(),
    expiredAt: z.date().nullable()
  })
  .merge(updateAndCreate)
  .merge(id);

export const guestDto = guest.pick({
  id: true,
  tableNumber: true,
  token: true,
  createdAt: true
});

const order = z
  .object({
    guestId: z.string().uuid().nullable(),
    tableNumber: z.string().trim().min(1).max(50),
    token: z.string(),
    dishSnapshotId: z.string().uuid(),
    options: z.string().nullable(),
    quantity: z.number().int().min(1).max(20),
    orderHandlerId: z.string().uuid().nullable(),
    status: z.nativeEnum(OrderStatus)
  })
  .merge(updateAndCreate)
  .merge(id);

export const orderDto = order;

export const tableNumberParam = orderDto.pick({
  tableNumber: true
});

export const orderDtoDetail = orderDto.extend({
  guest: guestDto.nullable(),
  table: tableDto,
  orderHandler: accountDto.nullable(),
  dishSnapshot: dishSnapshotDto
});

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
  );

export const createOrders = z.object({
  tableNumber: z.string().trim().min(1).max(50),
  dishes: z.array(
    z.object({
      dishId: z.string().uuid(),
      quantity: z.number(),
      options: z.string().nullable()
    })
  )
});

export const selectOrderDtoDetail = buildSelect(orderDtoDetail);
export const ordersDtoDetailRes = buildReply(z.array(orderDtoDetail));
export const orderDtoDetailRes = buildReply(orderDtoDetail);
export const payOrders = z.object({
  tableNumber: z.string().trim().min(1).max(50)
});
export const tableDtoDetail = tableDto.extend({
  orders: z.array(orderDtoDetail),
  guests: z.array(guestDto)
});
export const tableDtoDetailsRes = buildReply(z.array(tableDtoDetail));
export const tableDtoDetailRes = buildReply(tableDtoDetail);
export const selectTableDtoDetail = buildSelect(tableDtoDetail);

export type UpdateOrder = z.TypeOf<typeof updateOrder>;
export type CreateOrders = z.TypeOf<typeof createOrders>;
export type TableNumberParam = z.TypeOf<typeof tableNumberParam>;
export type GuestPayOrders = z.TypeOf<typeof payOrders>;
export type OrderDtoDetailRes = z.TypeOf<typeof orderDtoDetailRes>;
export type OrdersDtoDetailRes = z.TypeOf<typeof ordersDtoDetailRes>;
export type TableDtoDetailsRes = z.TypeOf<typeof tableDtoDetailsRes>;
export type TableDtoDetailRes = z.TypeOf<typeof tableDtoDetailRes>;
export type TableDtoDetail = z.TypeOf<typeof tableDtoDetail>;
