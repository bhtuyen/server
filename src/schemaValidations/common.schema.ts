import z from 'zod';

export const message = z.object({
  message: z.string().default('')
});

export const messageRes = message.strict();

export type MessageRes = z.TypeOf<typeof message>;

export const create = z.object({
  createdAt: z.date().default(new Date())
});

export const update = z.object({
  updatedAt: z.date()
});

export const updateAndCreate = create.merge(update);

export const id = z.object({
  id: z.string().uuid()
});

export const idParam = id.pick({ id: true });

export type IdParam = z.TypeOf<typeof idParam>;

export const name = z.object({
  name: z.string().trim().min(1).max(255)
});

export const buildReply = <T>(data: z.ZodType<T>) => {
  return message.merge(z.object({ data })).strict();
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
