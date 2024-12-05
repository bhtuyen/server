import { buildReply } from '@/schemaValidations/common.schema';
import z from 'zod';

export const uploadImageRes = buildReply(z.string().url());

export type UploadImageRes = z.TypeOf<typeof uploadImageRes>;
