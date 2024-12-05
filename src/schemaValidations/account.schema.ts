import { message } from '@/schemaValidations/common.schema';
import { buildSelect } from '@/utils/helpers';
import { Role } from '@prisma/client';
import z from 'zod';

const account = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(2).max(256),
  email: z.string().email(),
  password: z.string().min(6).max(100),
  avatar: z.string().url().nullable().optional(),
  role: z.nativeEnum(Role),
  phone: z.string().min(10).max(15),
  isVerified: z.boolean().default(false),
  ownerId: z.string().uuid().nullable().optional(),
  createdAt: z.date().nullable().optional(),
  updatedAt: z.date().nullable().optional()
});

export const accountDto = account.omit({
  createdAt: true,
  updatedAt: true
});

export const accountsRes = z
  .object({
    data: z.array(accountDto)
  })
  .merge(message);

export const accountRes = z
  .object({
    data: accountDto
  })
  .merge(message);

export type Account = z.TypeOf<typeof account>;
export type AccountDto = z.TypeOf<typeof accountDto>;

export type AccountsRes = z.TypeOf<typeof accountsRes>;

export type AccountRes = z.TypeOf<typeof accountRes>;

export const selectAccountDto = buildSelect<AccountDto>();

export const createEmployee = account
  .pick({
    name: true,
    email: true,
    phone: true,
    avatar: true,
    password: true
  })
  .extend({
    confirmPassword: z.string().min(6).max(100)
  })
  .strict()
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

export const updateEmployee = account
  .pick({
    name: true,
    email: true,
    phone: true,
    avatar: true
  })
  .extend({
    changePassword: z.boolean().optional(),
    password: z.string().min(6).max(100).optional(),
    confirmPassword: z.string().min(6).max(100).optional(),
    role: z.enum([Role.Employee, Role.Owner]).optional().default(Role.Employee)
  })
  .strict()
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

export const updateMeSchema = account
  .pick({
    name: true,
    avatar: true
  })
  .strict();

export type UpdateMe = z.TypeOf<typeof updateMeSchema>;

export const changePasswordSchema = z
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

export type ChangePassword = z.TypeOf<typeof changePasswordSchema>;

export const accountIdParamSchema = z.object({
  id: z.string().uuid()
});

export type AccountIdParam = z.TypeOf<typeof accountIdParamSchema>;

export const GetListGuestsRes = z
  .object({
    data: z.array(
      z.object({
        id: z.string().uuid(),
        name: z.string(),
        tableNumber: z.string().nullable(),
        createdAt: z.date(),
        updatedAt: z.date()
      })
    )
  })
  .merge(message);

export type GetListGuestsResType = z.TypeOf<typeof GetListGuestsRes>;

export const GetGuestListQueryParams = z.object({
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional()
});

export type GetGuestListQueryParamsType = z.TypeOf<typeof GetGuestListQueryParams>;

export const CreateGuestBody = z
  .object({
    name: z.string().trim().min(2).max(255),
    tableNumber: z.string().min(1).max(50)
  })
  .strict();

export type CreateGuestBodyType = z.TypeOf<typeof CreateGuestBody>;

export const CreateGuestRes = z
  .object({
    data: z.object({
      id: z.string().uuid(),
      name: z.string().nullable(),
      role: z.enum([Role.Guest]),
      tableNumber: z.string().min(1).max(50),
      createdAt: z.date(),
      updatedAt: z.date()
    })
  })
  .merge(message);

export type CreateGuestResType = z.TypeOf<typeof CreateGuestRes>;
