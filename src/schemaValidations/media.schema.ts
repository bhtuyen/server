import z from 'zod';

import { buildReply } from '@/schemaValidations/common.schema';

export const uploadImageRes = buildReply(z.string().url());

export type UploadImageRes = z.TypeOf<typeof uploadImageRes>;
