import { Role } from '@prisma/client';

import type { FastifyRequest } from 'fastify';

import { GuestOrderRole } from '@/constants/const';
import { AuthError } from '@/utils/errors';
import { verifyAccessToken } from '@/utils/jwt';

export const pauseApiHook = async (request: FastifyRequest) => {
  // throw new ForbiddenError('Chức năng bị tạm ngưng')
};

export const requireLoginedHook = async (request: FastifyRequest) => {
  const accessToken = request.headers.authorization?.split(' ')[1];
  if (!accessToken) throw new AuthError('Không nhận được access token');
  try {
    const decodedAccessToken = verifyAccessToken(accessToken);
    request.decodedAccessToken = decodedAccessToken;
  } catch {
    throw new AuthError('Access token không hợp lệ');
  }
};

export const requireOwnerHook = async (request: FastifyRequest) => {
  if (request.decodedAccessToken?.role !== Role.Owner) {
    throw new AuthError('Bạn không có quyền truy cập');
  }
};

export const requireEmployeeHook = async (request: FastifyRequest) => {
  if (request.decodedAccessToken?.role !== Role.Employee) {
    throw new AuthError('Bạn không có quyền truy cập');
  }
};

export const requireGuestOrderHook = async (request: FastifyRequest) => {
  if (request.decodedAccessToken?.role !== GuestOrderRole) {
    throw new AuthError('Bạn không có quyền truy cập');
  }
};

export const requiredSePayKeyHook = async (request: FastifyRequest) => {
  //Apikey API_KEY_CUA_BAN
  const sePayKey = request.headers.authorization?.split(' ')[1];
  if (!sePayKey) {
    throw new AuthError('Không nhận được API Key');
  }

  if (sePayKey !== process.env.SEPAY_KEY) {
    throw new AuthError('API Key không hợp lệ');
  }
};
