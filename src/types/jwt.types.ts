import type { Token } from '@/constants/enum';
import type { Role } from '@prisma/client';

export interface TokenPayload {
  userId: string;
  role: Role;
  token: Token;
  exp: number;
  iat: number;
}

export interface TableTokenPayload {
  iat: number;
  number: number;
  type: Token;
}
