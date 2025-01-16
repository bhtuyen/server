import type { IdParam, Period } from '@/schemaValidations/common.schema';
import type { CreateOrders, OrderDtoDetailRes, OrdersDtoDetailRes, TableNumberParam, UpdateOrder } from '@/schemaValidations/order.schema';
import type { FastifyInstance } from 'fastify';

import { GuestOrderRole, ManagerRoom } from '@/constants/const';
import orderController from '@/controllers/order.controller';
import { requireEmployeeHook, requireGuestOrderHook, requireLoginedHook, requireOwnerHook } from '@/hooks/auth.hooks';
import { idParam, period } from '@/schemaValidations/common.schema';
import { createOrders, orderDtoDetailRes, ordersDtoDetailRes, updateOrder, tableNumberParam } from '@/schemaValidations/order.schema';

export default async function orderRoutes(fastify: FastifyInstance) {
  /**
   * @POST /api/orders
   * @description Create orders for table
   * @buihuytuyen
   */
  fastify.post<{ Reply: OrdersDtoDetailRes; Body: CreateOrders }>(
    '/',
    {
      schema: {
        response: {
          200: ordersDtoDetailRes
        },
        body: createOrders
      },
      preValidation: fastify.auth([requireLoginedHook, [requireOwnerHook, requireEmployeeHook]], {
        relation: 'and'
      })
    },
    async ({ decodedAccessToken, body }, reply) => {
      if (decodedAccessToken && !(decodedAccessToken.role === GuestOrderRole)) {
        const { accountId } = decodedAccessToken;
        const { socketIds, orders } = await orderController.creates(accountId, body);
        if (socketIds.length > 0) {
          fastify.io.to(ManagerRoom).to(socketIds).emit('new-order', orders.length, orders[0].tableNumber);
        } else {
          fastify.io.to(ManagerRoom).emit('new-order', orders.length, orders[0].tableNumber);
        }
        reply.send({
          message: 'create-orders-success',
          data: orders
        });
      }
    }
  );

  /**
   * @GET /api/orders
   * @description Get orders list by period
   * @buihuytuyen
   */
  fastify.get<{ Reply: OrdersDtoDetailRes; Querystring: Period }>(
    '/',
    {
      schema: {
        response: {
          200: ordersDtoDetailRes
        },
        querystring: period
      },
      preValidation: fastify.auth([requireLoginedHook, [requireOwnerHook, requireEmployeeHook]], {
        relation: 'and'
      })
    },
    async (request, reply) => {
      const data = await orderController.getByPeriod({
        fromDate: request.query.fromDate,
        toDate: request.query.toDate
      });

      reply.send({
        message: 'Lấy danh sách đơn hàng thành công',
        data
      });
    }
  );

  /**
   * @GET /api/orders
   * @description get orders by table
   * @buihuytuyen
   */
  fastify.get<{
    Reply: OrdersDtoDetailRes;
    Params: TableNumberParam;
  }>(
    '/table/:tableNumber',
    {
      schema: {
        response: {
          200: ordersDtoDetailRes
        },
        params: tableNumberParam
      },
      preValidation: fastify.auth([requireLoginedHook, requireGuestOrderHook])
    },
    async (request, reply) => {
      const { tableNumber } = request.params;
      const result = await orderController.getByTable(tableNumber);
      reply.send({
        message: 'Lấy danh sách đơn hàng thành công',
        data: result
      });
    }
  );

  /**
   * @GET /api/orders/:id
   * @description Get order detail by id
   * @buihuytuyen
   */
  fastify.get<{ Reply: OrderDtoDetailRes; Params: IdParam }>(
    '/:id',
    {
      schema: {
        response: {
          200: orderDtoDetailRes
        },
        params: idParam
      },
      preValidation: fastify.auth([requireLoginedHook, [requireOwnerHook, requireEmployeeHook]], {
        relation: 'and'
      })
    },
    async (request, reply) => {
      const data = await orderController.getDetail(request.params.id);
      reply.send({
        message: 'Lấy đơn hàng thành công',
        data
      });
    }
  );

  /**
   * @PUT /api/orders/:id
   * @description Update order by id
   * @buihuytuyen
   */
  fastify.put<{ Reply: OrderDtoDetailRes; Body: UpdateOrder; Params: IdParam }>(
    '/:id',
    {
      schema: {
        response: {
          200: orderDtoDetailRes
        },
        body: updateOrder,
        params: idParam
      },
      preValidation: fastify.auth([requireLoginedHook, [requireOwnerHook, requireEmployeeHook]], {
        relation: 'and'
      })
    },
    async (request, reply) => {
      const role = request.decodedAccessToken?.role;
      if (role !== GuestOrderRole && request.decodedAccessToken) {
        const accountId = request.decodedAccessToken.accountId;
        const { order, socketIds } = await orderController.update({ ...request.body, id: request.params.id }, accountId);
        if (socketIds.length > 0) {
          fastify.io.to(ManagerRoom).to(socketIds).emit('update-order', order);
        } else {
          fastify.io.to(ManagerRoom).emit('update-order', order);
        }
        reply.send({
          message: 'update-order-success',
          data: order
        });
      }
    }
  );
}
