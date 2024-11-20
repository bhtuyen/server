import { Role, Token } from '@/constants/type';

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
