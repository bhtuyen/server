import { accountDto } from '@/schemaValidations/account.schema';
import { buildReply } from '@/schemaValidations/common.schema';
import z from 'zod';

export const token = z
  .object({
    accessToken: z.string(),
    refreshToken: z.string()
  })
  .strict();

export const login = accountDto
  .pick({
    email: true,
    password: true
  })
  .strict();

export type Login = z.TypeOf<typeof login>;

export const loginRes = buildReply(
  z
    .object({
      account: accountDto
    })
    .merge(token)
);

export type LoginRes = z.TypeOf<typeof loginRes>;

export const refreshToken = token.pick({ refreshToken: true });

export type RefreshToken = z.TypeOf<typeof refreshToken>;

export const refreshTokenRes = buildReply(token);

export type RefreshTokenRes = z.TypeOf<typeof refreshTokenRes>;

export const logout = token.pick({ refreshToken: true });

export type Logout = z.TypeOf<typeof logout>;

export const loginGoogle = z.object({
  code: z.string()
});

export type LoginGoogle = z.TypeOf<typeof loginGoogle>;
