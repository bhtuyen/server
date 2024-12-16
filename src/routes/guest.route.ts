import type { Logout, RefreshToken, RefreshTokenRes } from '@/schemaValidations/auth.schema';
import type { MessageRes, Period } from '@/schemaValidations/common.schema';
import type {
  CreateGuest,
  CreateGuestRes,
  GuestCreateOrderRes,
  GuestCreateOrders,
  GuestLogin,
  GuestLoginRes,
  GuestsRes
} from '@/schemaValidations/guest.schema';
import type { FastifyInstance } from 'fastify';

import { ManagerRoom } from '@/constants/const';
import guestController from '@/controllers/guest.controller';
import { requireEmployeeHook, requireGuestHook, requireLoginedHook, requireOwnerHook } from '@/hooks/auth.hooks';
import { logout, refreshToken, refreshTokenRes } from '@/schemaValidations/auth.schema';
import { message, period } from '@/schemaValidations/common.schema';
import {
  createGuest,
  createGuestRes,
  guestCreateOrderRes,
  guestCreateOrders,
  guestLogin,
  guestLoginRes,
  guestsRes
} from '@/schemaValidations/guest.schema';

export default async function guestRoutes(fastify: FastifyInstance) {
  /**
   * @description Guest login
   * @buihuytuyen
   */
  fastify.post<{ Reply: GuestLoginRes; Body: GuestLogin }>(
    '/auth/login',
    {
      schema: {
        response: {
          200: guestLoginRes
        },
        body: guestLogin
      }
    },
    async (request, reply) => {
      const { body } = request;
      const result = await guestController.guestLogin(body);
      reply.send({
        message: 'Đăng nhập thành công',
        data: result
      });
    }
  );

  /**
   * @description Guest logout
   * @buihuytuyen
   */
  fastify.post<{ Reply: MessageRes; Body: Logout }>(
    '/auth/logout',
    {
      schema: {
        response: {
          200: message
        },
        body: logout
      },
      preValidation: fastify.auth([requireLoginedHook])
    },
    async (request, reply) => {
      const message = await guestController.guestLogout(request.decodedAccessToken!.userId);
      reply.send({
        message
      });
    }
  );

  /**
   * @description Guest refresh token
   * @buihuytuyen
   */
  fastify.post<{
    Reply: RefreshTokenRes;
    Body: RefreshToken;
  }>(
    '/auth/refresh-token',
    {
      schema: {
        response: {
          200: refreshTokenRes
        },
        body: refreshToken
      }
    },
    async (request, reply) => {
      const result = await guestController.guestRefreshToken(request.body.refreshToken);
      reply.send({
        message: 'Lấy token mới thành công',
        data: result
      });
    }
  );

  /**
   * @description Guest create order
   * @buihuytuyen
   */
  fastify.post<{
    Reply: GuestCreateOrderRes;
    Body: GuestCreateOrders;
  }>(
    '/orders',
    {
      schema: {
        response: {
          200: guestCreateOrderRes
        },
        body: guestCreateOrders
      },
      preValidation: fastify.auth([requireLoginedHook, requireGuestHook])
    },
    async (request, reply) => {
      const guestId = request.decodedAccessToken?.userId;
      const result = await guestController.guestCreateOrders(guestId!, request.body);
      fastify.io.to(ManagerRoom).emit('new-order', result);
      reply.send({
        message: 'Đặt món thành công',
        data: result
      });
    }
  );

  /**
   * @description Guest get orders
   * @buihuytuyen
   */
  fastify.get<{
    Reply: GuestCreateOrderRes;
  }>(
    '/orders',
    {
      schema: {
        response: {
          200: guestCreateOrderRes
        }
      },
      preValidation: fastify.auth([requireLoginedHook, requireGuestHook])
    },
    async (request, reply) => {
      const guestId = request.decodedAccessToken?.userId;
      const result = await guestController.guestGetOrders(guestId!);
      reply.send({
        message: 'Lấy danh sách đơn hàng thành công',
        data: result
      });
    }
  );

  /**
   * @description Create guest
   * @buihuytuyen
   */
  fastify.post<{ Reply: CreateGuestRes; Body: CreateGuest }>(
    '/guests',
    {
      schema: {
        response: {
          200: createGuestRes
        },
        body: createGuest
      },
      preValidation: fastify.auth([requireOwnerHook, requireEmployeeHook], {
        relation: 'or'
      })
    },
    async (request, reply) => {
      const result = await guestController.createGuest(request.body);
      reply.send({
        message: 'Tạo tài khoản khách thành công',
        data: result
      });
    }
  );

  /**
   * @description Get guest list
   * @buihuytuyen
   */
  fastify.get<{ Reply: GuestsRes; Querystring: Period }>(
    '/guests',
    {
      schema: {
        response: {
          200: guestsRes
        },
        querystring: period
      },
      preValidation: fastify.auth([requireOwnerHook, requireEmployeeHook], {
        relation: 'or'
      })
    },
    async ({ query: { fromDate, toDate } }, reply) => {
      const result = await guestController.getGuests({
        fromDate,
        toDate
      });
      reply.send({
        message: 'Lấy danh sách khách thành công',
        data: result
      });
    }
  );
}
