import z from 'zod';

export const message = z.object({
  message: z.string()
});

export const messageRes = message;
export type MessageRes = z.TypeOf<typeof message>;

export const create = z.object({
  createdAt: z.date()
});

export const update = z.object({
  updatedAt: z.date()
});

export const updateAndCreate = create.merge(update);

export const id = z.object({
  id: z.string().uuid()
});

export const idParam = id.pick({ id: true });

export const idOrNumberParam = z.object({
  idOrNumber: z.string().uuid().or(z.string().trim().min(1).max(50))
});

export type IdOrNumberParam = z.TypeOf<typeof idOrNumberParam>;

export type IdParam = z.TypeOf<typeof idParam>;

export const name = z.object({
  name: z.string().trim().min(1).max(255)
});

export const buildReply = <T>(data: z.ZodType<T>) => {
  return message.merge(z.object({ data }));
};

export const period = z
  .object({
    fromDate: z.coerce.date(),
    toDate: z.coerce.date()
  })
  .superRefine(({ fromDate, toDate }, ctx) => {
    if (fromDate > toDate) {
      ctx.addIssue({
        code: 'custom',
        message: 'fromDate phải nhỏ hơn toDate',
        path: ['fromDate']
      });
    }
  });

export type Period = z.TypeOf<typeof period>;
