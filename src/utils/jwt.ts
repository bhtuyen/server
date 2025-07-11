import { createSigner, createVerifier } from 'fast-jwt';
import ms from 'ms';

import type { DataPayload, TokenPayload } from '@/types/jwt.types';
import type { PrivateKey, SignerOptions } from 'fast-jwt';

import envConfig from '@/config';
import { Token } from '@/constants/enum';

export const signAccessToken = (payload: DataPayload & { exp?: number }, options?: SignerOptions) => {
  const { exp } = payload;
  const optionSigner: Partial<SignerOptions & { key: string | Buffer | PrivateKey }> = exp
    ? {
        key: envConfig.ACCESS_TOKEN_SECRET,
        algorithm: 'HS256',
        ...options
      }
    : {
        key: envConfig.ACCESS_TOKEN_SECRET,
        algorithm: 'HS256',
        expiresIn: ms(envConfig.ACCESS_TOKEN_EXPIRES_IN),
        ...options
      };
  const signSync = createSigner(optionSigner);
  return signSync({ ...payload, tokenType: Token.AccessToken });
};

export const signRefreshToken = (payload: DataPayload & { exp?: number }, options?: SignerOptions) => {
  const { exp } = payload;
  const optionSigner: Partial<SignerOptions & { key: string | Buffer | PrivateKey }> = exp
    ? {
        key: envConfig.REFRESH_TOKEN_SECRET,
        algorithm: 'HS256',
        ...options
      }
    : {
        key: envConfig.REFRESH_TOKEN_SECRET,
        algorithm: 'HS256',
        expiresIn: ms(envConfig.REFRESH_TOKEN_EXPIRES_IN),
        ...options
      };
  const signSync = createSigner(optionSigner);
  return signSync({ ...payload, tokenType: Token.RefreshToken });
};

export const verifyAccessToken = (token: string) => {
  const verifySync = createVerifier({
    key: envConfig.ACCESS_TOKEN_SECRET
  });
  return verifySync(token) as TokenPayload;
};

export const verifyRefreshToken = (token: string) => {
  const verifySync = createVerifier({
    key: envConfig.REFRESH_TOKEN_SECRET
  });
  return verifySync(token) as TokenPayload;
};
