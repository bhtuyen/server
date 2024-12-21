import type { GuestOrderRole } from '@/constants/const';
import type { Token } from '@/constants/enum';
import type { Role } from '@prisma/client';

export type TokenPayload = {
  token: Token;
  exp: number;
  iat: number;
} & DataPayload;

export type DataPayload =
  | {
      tableNumber: string;
      tableToken: string;
      guestId: string;
      role: typeof GuestOrderRole;
    }
  | {
      accountId: string;
      role: Role;
    };

export interface TableTokenPayload {
  iat: number;
  number: number;
  type: Token;
}
