import { ManagerRoom } from '@/constants/const';
import {
  guestCreateOrdersController,
  guestGetOrdersController,
  guestLoginController,
  guestLogoutController,
  guestRefreshTokenController
} from '@/controllers/guest.controller';
import { requireGuestHook, requireLoginedHook } from '@/hooks/auth.hooks';
import {
  logout,
  Logout,
  refreshToken,
  RefreshToken,
  refreshTokenRes,
  RefreshTokenRes
} from '@/schemaValidations/auth.schema';
import { message, MessageRes } from '@/schemaValidations/common.schema';
import {
  GuestCreateOrder,
  guestCreateOrder,
  GuestCreateOrderRes,
  guestCreateOrderRes,
  GuestLogin,
  guestLogin,
  GuestLoginRes,
  guestLoginRes
} from '@/schemaValidations/guest.schema';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';

export default async function guestRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
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
      const result = await guestLoginController(body);
      reply.send({
        message: 'Đăng nhập thành công',
        data: {
          guest: {
            id: result.guest.id,
            tableNumber: result.guest.tableNumber
          },
          accessToken: result.accessToken,
          refreshToken: result.refreshToken
        }
      });
    }
  );
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
      const message = await guestLogoutController(request.decodedAccessToken!.userId);
      reply.send({
        message
      });
    }
  );

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
      const result = await guestRefreshTokenController(request.body.refreshToken);
      reply.send({
        message: 'Lấy token mới thành công',
        data: result
      });
    }
  );

  fastify.post<{
    Reply: GuestCreateOrderRes;
    Body: GuestCreateOrder;
  }>(
    '/orders',
    {
      schema: {
        response: {
          200: guestCreateOrderRes
        },
        body: guestCreateOrder
      },
      preValidation: fastify.auth([requireLoginedHook, requireGuestHook])
    },
    async (request, reply) => {
      const guestId = request.decodedAccessToken?.userId;
      const result = await guestCreateOrdersController(guestId!, request.body);
      fastify.io.to(ManagerRoom).emit('new-order', result);
      reply.send({
        message: 'Đặt món thành công',
        data: result as GuestCreateOrderRes['data']
      });
    }
  );

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
      const result = await guestGetOrdersController(guestId!);
      reply.send({
        message: 'Lấy danh sách đơn hàng thành công',
        data: result as GuestCreateOrderRes['data']
      });
    }
  );
}
