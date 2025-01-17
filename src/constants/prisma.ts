import { Prisma } from '@prisma/client';

export const prismaOptions = {
  isolationLevel: Prisma.TransactionIsolationLevel.Serializable, // optional, default defined by database configuration
  maxWait: 5000, // default: 2000
  timeout: 10000 // default: 5000
};
