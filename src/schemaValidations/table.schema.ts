import { PaymentStatus, TableStatus } from '@prisma/client';
import z from 'zod';

import { buildReply, id, updateAndCreate } from '@/schemaValidations/common.schema';
import { buildSelect } from '@/utils/helpers';

/**
 * Schema
 */
const table = z
  .object({
    number: z.string().trim().min(1).max(50),
    paymentStatus: z.nativeEnum(PaymentStatus).default(PaymentStatus.Unpaid),
    capacity: z.coerce.number().positive(),
    status: z.nativeEnum(TableStatus),
    dishBuffetId: z.string().uuid().nullable(),
    requestPayment: z.boolean(),
    callStaff: z.boolean(),
    token: z.string()
  })
  .merge(updateAndCreate)
  .merge(id);
export const tableDto = table.omit({
  createdAt: true,
  updatedAt: true
});
export const createTable = tableDto.omit({ token: true, id: true });
export const tableRes = buildReply(tableDto);
export const tablesRes = buildReply(z.array(tableDto));
export const tableParam = tableDto.pick({ number: true });
export const updateTable = tableDto.omit({ token: true }).extend({ changeToken: z.boolean() });
export const selectTableDto = buildSelect(tableDto);

export const modeBuffet = z.object({
  dishBuffetId: z.string().uuid().nullable(),
  tableNumber: z.string().trim().min(1).max(50)
});

export const resetTable = z.object({
  tableNumber: z.string().trim().min(1).max(50)
});

/**
 * Type
 */
export type TableRes = z.TypeOf<typeof tableRes>;
export type CreateTable = z.TypeOf<typeof createTable>;
export type TablesRes = z.TypeOf<typeof tablesRes>;
export type UpdateTable = z.TypeOf<typeof updateTable>;
export type TableParam = z.TypeOf<typeof tableParam>;
export type TableDto = z.TypeOf<typeof tableDto>;
export type ModeBuffet = z.TypeOf<typeof modeBuffet>;

export type ResetTable = z.TypeOf<typeof resetTable>;
