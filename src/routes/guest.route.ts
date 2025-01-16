import type { Logout, RefreshToken, RefreshTokenRes } from '@/schemaValidations/auth.schema';
import type { MessageRes, Period } from '@/schemaValidations/common.schema';
import type { CallStaff, GuestCreateOrders, GuestLogin, GuestLoginRes, GuestsRes, RequestPayment } from '@/schemaValidations/guest.schema';
import type { OrdersDtoDetailRes } from '@/schemaValidations/order.schema';
import type { FastifyInstance } from 'fastify';

import { GuestOrderRole, ManagerRoom } from '@/constants/const';
import guestController from '@/controllers/guest.controller';
import { requireEmployeeHook, requireGuestOrderHook, requireLoginedHook, requireOwnerHook } from '@/hooks/auth.hooks';
import { logout, refreshToken, refreshTokenRes } from '@/schemaValidations/auth.schema';
import { message, messageRes, period } from '@/schemaValidations/common.schema';
import { callStaff, guestCreateOrders, guestLogin, guestLoginRes, guestsRes, requestPayment } from '@/schemaValidations/guest.schema';
import { ordersDtoDetailRes } from '@/schemaValidations/order.schema';

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
    async ({ decodedAccessToken }, reply) => {
      if (decodedAccessToken && decodedAccessToken.role === GuestOrderRole) {
        const { guestId } = decodedAccessToken;
        const message = await guestController.guestLogout(guestId);
        reply.send({
          message
        });
      }

      reply.send({
        message: 'Đăng xuất thành công'
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
    Reply: {
      200: OrdersDtoDetailRes;
      400: MessageRes;
    };
    Body: GuestCreateOrders;
  }>(
    '/orders',
    {
      schema: {
        response: {
          200: ordersDtoDetailRes,
          400: messageRes
        },
        body: guestCreateOrders
      },
      preValidation: fastify.auth([requireLoginedHook, requireGuestOrderHook])
    },
    async ({ decodedAccessToken, body }, reply) => {
      if (decodedAccessToken && decodedAccessToken.role === GuestOrderRole) {
        const { guestId } = decodedAccessToken;
        const result = await guestController.guestCreateOrders(guestId, body);
        fastify.io.to(ManagerRoom).emit('new-order', result.length, result[0].tableNumber);
        reply.status(200).send({
          message: 'order-success',
          data: result
        });
      }

      reply.status(400).send({
        message: 'Bạn không có quyền đặt món'
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

  /**
   * @description Request payment
   * @buihuytuyen
   */
  fastify.post<{
    Reply: MessageRes;
    Body: RequestPayment;
  }>(
    '/request-payment',
    {
      schema: {
        response: {
          200: messageRes
        },
        body: requestPayment
      },
      preValidation: fastify.auth([requireLoginedHook, requireGuestOrderHook])
    },
    async (request, reply) => {
      await guestController.requestPayment(request.body.tableNumber);
      fastify.io.to(ManagerRoom).emit('request-payment', request.body.tableNumber);
      reply.send({
        message: 'request-payment-success'
      });
    }
  );

  /**
   * @description Request payment
   * @buihuytuyen
   */
  fastify.post<{
    Reply: MessageRes;
    Body: CallStaff;
  }>(
    '/call-staff',
    {
      schema: {
        response: {
          200: messageRes
        },
        body: callStaff
      },
      preValidation: fastify.auth([requireLoginedHook, requireGuestOrderHook])
    },
    async (request, reply) => {
      await guestController.callStaff(request.body.tableNumber);
      fastify.io.to(ManagerRoom).emit('call-staff', request.body.tableNumber);
      reply.send({
        message: 'call-staff-success'
      });
    }
  );
}
