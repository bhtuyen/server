import { buildReply, updateAndCreate } from '@/schemaValidations/common.schema';
import { TableStatus } from '@prisma/client';
import z from 'zod';

/**
 * Schema
 */
export const table = z
  .object({
    number: z.string().trim().min(1).max(50),
    capacity: z.coerce.number().positive().default(1),
    status: z.nativeEnum(TableStatus).default(TableStatus.Available),
    token: z.string()
  })
  .merge(updateAndCreate);
export const tableDto = table.omit({
  createdAt: true,
  updatedAt: true
});
export const createTable = tableDto.omit({ token: true });
export const tableRes = buildReply(tableDto);
export const tablesRes = buildReply(z.array(tableDto));
export const tableParam = tableDto.pick({ number: true });
export const updateTable = tableDto.omit({ token: true }).extend({ changeToken: z.boolean().default(false) });

/**
 * Type
 */
export type TableResType = z.TypeOf<typeof tableRes>;
export type CreateTable = z.TypeOf<typeof createTable>;
export type TablesRes = z.TypeOf<typeof tablesRes>;
export type UpdateTable = z.TypeOf<typeof updateTable>;
export type TableParam = z.TypeOf<typeof tableParam>;
