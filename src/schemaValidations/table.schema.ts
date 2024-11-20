import { TableStatus } from '@/constants/type';
import z from 'zod';

export const CreateTableBody = z.object({
  number: z.string(),
  capacity: z.coerce.number().positive(),
  status: z.enum([TableStatus.Available, TableStatus.Reserved, TableStatus.Hidden]).optional()
});

export type CreateTableBodyType = z.TypeOf<typeof CreateTableBody>;

export const TableSchema = z.object({
  number: z.string(),
  capacity: z.coerce.number(),
  status: z.enum([TableStatus.Available, TableStatus.Reserved, TableStatus.Hidden]),
  token: z.string(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const TableRes = z.object({
  data: TableSchema,
  message: z.string()
});

export type TableResType = z.TypeOf<typeof TableRes>;

export const TableListRes = z.object({
  data: z.array(TableSchema),
  message: z.string()
});

export type TableListResType = z.TypeOf<typeof TableListRes>;

export const UpdateTableBody = z.object({
  changeToken: z.boolean(),
  capacity: z.coerce.number().positive(),
  status: z.enum([TableStatus.Available, TableStatus.Reserved, TableStatus.Hidden]).optional()
});
export type UpdateTableBodyType = z.TypeOf<typeof UpdateTableBody>;
export const TableParams = z.object({
  number: z.string()
});
export type TableParamsType = z.TypeOf<typeof TableParams>;
