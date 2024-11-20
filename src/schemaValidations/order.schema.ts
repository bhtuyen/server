import { DishStatus, DishCategory, OrderStatus } from '@/constants/type';
import { AccountSchema } from '@/schemaValidations/account.schema';
import { TableSchema } from '@/schemaValidations/table.schema';
import z from 'zod';

const DishSnapshotSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  price: z.number().positive(),
  image: z.string().url(),
  description: z.string(),
  category: z.enum([DishCategory.Buffet, DishCategory.Paid]),
  options: z.string(),
  groupId: z.string().uuid(),
  status: z.enum([DishStatus.Available, DishStatus.Unavailable, DishStatus.Hidden]),
  dishId: z.string().uuid().nullable(),
  createdAt: z.date(),
  updatedAt: z.date()
});
export const OrderSchema = z.object({
  id: z.string().uuid(),
  guestId: z.string().uuid().nullable(),
  guest: z
    .object({
      id: z.string().uuid(),
      name: z.string(),
      tableNumber: z.string().nullable(),
      createdAt: z.date(),
      updatedAt: z.date()
    })
    .nullable(),
  tableNumber: z.string().nullable(),
  dishSnapshotId: z.string().uuid(),
  dishSnapshot: DishSnapshotSchema,
  quantity: z.number(),
  orderHandlerId: z.string().uuid().nullable(),
  orderHandler: AccountSchema.nullable(),
  status: z.enum([
    OrderStatus.Processing,
    OrderStatus.Delivered,
    OrderStatus.Paid,
    OrderStatus.Rejected,
    OrderStatus.Pending
  ]),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const UpdateOrderBody = z.object({
  status: z.enum([
    OrderStatus.Processing,
    OrderStatus.Delivered,
    OrderStatus.Paid,
    OrderStatus.Rejected,
    OrderStatus.Pending
  ]),
  dishId: z.string().uuid(),
  quantity: z.number()
});

export type UpdateOrderBodyType = z.TypeOf<typeof UpdateOrderBody>;

export const OrderParam = z.object({
  orderId: z.string().uuid()
});

export type OrderParamType = z.TypeOf<typeof OrderParam>;

export const UpdateOrderRes = z.object({
  message: z.string(),
  data: OrderSchema
});

export type UpdateOrderResType = z.TypeOf<typeof UpdateOrderRes>;

export const GetOrdersQueryParams = z.object({
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional()
});

export type GetOrdersQueryParamsType = z.TypeOf<typeof GetOrdersQueryParams>;

export const GetOrdersRes = z.object({
  message: z.string(),
  data: z.array(OrderSchema)
});

export type GetOrdersResType = z.TypeOf<typeof GetOrdersRes>;

export const GetOrderDetailRes = z.object({
  message: z.string(),
  data: OrderSchema.extend({
    table: TableSchema
  })
});

export type GetOrderDetailResType = z.TypeOf<typeof GetOrderDetailRes>;

export const PayGuestOrdersBody = z.object({
  guestId: z.string().uuid()
});

export type PayGuestOrdersBodyType = z.TypeOf<typeof PayGuestOrdersBody>;

export const PayGuestOrdersRes = GetOrdersRes;

export type PayGuestOrdersResType = z.TypeOf<typeof PayGuestOrdersRes>;

export const CreateOrdersBody = z
  .object({
    guestId: z.string().uuid(),
    orders: z.array(
      z.object({
        dishId: z.string().uuid(),
        quantity: z.number()
      })
    )
  })
  .strict();

export type CreateOrdersBodyType = z.TypeOf<typeof CreateOrdersBody>;

export const CreateOrdersRes = z.object({
  message: z.string(),
  data: z.array(OrderSchema)
});

export type CreateOrdersResType = z.TypeOf<typeof CreateOrdersRes>;
