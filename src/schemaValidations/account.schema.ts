import { buildReply, id, name, updateAndCreate } from '@/schemaValidations/common.schema';
import { buildSelect } from '@/utils/helpers';
import { Role } from '@prisma/client';
import z from 'zod';

const account = z
  .object({
    email: z.string().email(),
    password: z.string().min(6).max(100),
    avatar: z.string().url().nullable().optional(),
    role: z.nativeEnum(Role),
    phone: z.string().min(10).max(15),
    isVerified: z.boolean().default(false),
    ownerId: z.string().uuid().nullable().optional()
  })
  .merge(updateAndCreate)
  .merge(id)
  .merge(name);

export const accountDto = account.omit({
  createdAt: true,
  updatedAt: true,
  password: true
});

export const accountsRes = buildReply(z.array(accountDto));

export const accountRes = buildReply(accountDto);

export type AccountDto = z.TypeOf<typeof accountDto>;

export type AccountsRes = z.TypeOf<typeof accountsRes>;

export type AccountRes = z.TypeOf<typeof accountRes>;

export const selectAccountDto = buildSelect(accountDto);

export const createEmployee = accountDto
  .pick({
    name: true,
    email: true,
    phone: true,
    avatar: true
  })
  .extend({
    confirmPassword: z.string().min(6).max(100),
    password: z.string().min(6).max(100)
  })
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: 'custom',
        message: 'Mật khẩu không khớp',
        path: ['confirmPassword']
      });
    }
  });

export type CreateEmployee = z.TypeOf<typeof createEmployee>;

export const updateEmployee = accountDto
  .pick({
    name: true,
    email: true,
    phone: true,
    avatar: true,
    id: true
  })
  .extend({
    changePassword: z.boolean().optional(),
    password: z.string().min(6).max(100).optional(),
    confirmPassword: z.string().min(6).max(100).optional(),
    role: z.enum([Role.Employee, Role.Owner]).optional().default(Role.Employee)
  })
  .superRefine(({ confirmPassword, password, changePassword }, ctx) => {
    if (changePassword) {
      if (!password || !confirmPassword) {
        ctx.addIssue({
          code: 'custom',
          message: 'Hãy nhập mật khẩu mới và xác nhận mật khẩu mới',
          path: ['changePassword']
        });
      } else if (confirmPassword !== password) {
        ctx.addIssue({
          code: 'custom',
          message: 'Mật khẩu không khớp',
          path: ['confirmPassword']
        });
      }
    }
  });

export type UpdateEmployee = z.TypeOf<typeof updateEmployee>;

export const updateMe = accountDto
  .pick({
    name: true,
    avatar: true
  })
  .strict();

export type UpdateMe = z.TypeOf<typeof updateMe>;

export const changePassword = z
  .object({
    oldPassword: z.string().min(6).max(100),
    password: z.string().min(6).max(100),
    confirmPassword: z.string().min(6).max(100)
  })
  .strict()
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: 'custom',
        message: 'Mật khẩu mới không khớp',
        path: ['confirmPassword']
      });
    }
  });

export type ChangePassword = z.TypeOf<typeof changePassword>;
