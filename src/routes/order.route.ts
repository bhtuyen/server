import { ManagerRoom } from '@/constants/const';
import {
  createOrdersController,
  getOrderDetailController,
  getOrdersController,
  payOrdersController,
  updateOrderController
} from '@/controllers/order.controller';
import { requireEmployeeHook, requireLoginedHook, requireOwnerHook } from '@/hooks/auth.hooks';
import type { IdParam, Period } from '@/schemaValidations/common.schema';
import { idParam, period } from '@/schemaValidations/common.schema';
import type {
  CreateOrders,
  GuestPayOrders,
  OrderDtoDetailRes,
  OrdersDtoDetailRes,
  UpdateOrder
} from '@/schemaValidations/order.schema';
import {
  createOrders,
  guestPayOrders,
  orderDtoDetailRes,
  ordersDtoDetailRes,
  updateOrder
} from '@/schemaValidations/order.schema';
import type { FastifyInstance, FastifyPluginOptions } from 'fastify';

export default async function orderRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
  /**
   * @description Require logined hook, require owner or employee hook
   * @buihuytuyen
   */
  fastify.addHook(
    'preValidation',
    fastify.auth([requireLoginedHook, [requireOwnerHook, requireEmployeeHook]], {
      relation: 'and'
    })
  );

  /**
   * @POST /api/orders
   * @description Create orders for guest
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
      }
    },
    async (request, reply) => {
      const { socketId, orders } = await createOrdersController(request.decodedAccessToken!.userId, request.body);
      if (socketId) {
        fastify.io.to(ManagerRoom).to(socketId).emit('new-order', orders);
      } else {
        fastify.io.to(ManagerRoom).emit('new-order', orders);
      }
      reply.send({
        message: `Tạo thành công ${orders.length} đơn hàng cho khách hàng`,
        data: orders
      });
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
      }
    },
    async (request, reply) => {
      const data = await getOrdersController({
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
      }
    },
    async (request, reply) => {
      const data = await getOrderDetailController(request.params.id);
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
      }
    },
    async (request, reply) => {
      const result = await updateOrderController(request.params.id, request.body);
      if (result.socketId) {
        fastify.io.to(result.socketId).to(ManagerRoom).emit('update-order', result.order);
      } else {
        fastify.io.to(ManagerRoom).emit('update-order', result.order);
      }
      reply.send({
        message: 'Cập nhật đơn hàng thành công',
        data: result.order
      });
    }
  );

  /**
   * @POST /api/orders/pay
   * @description Pay orders for guest
   * @buihuytuyen
   */
  fastify.post<{ Body: GuestPayOrders; Reply: OrdersDtoDetailRes }>(
    '/pay',
    {
      schema: {
        response: {
          200: ordersDtoDetailRes
        },
        body: guestPayOrders
      }
    },
    async (request, reply) => {
      const result = await payOrdersController({
        guestId: request.body.guestId,
        orderHandlerId: request.decodedAccessToken!.userId
      });
      if (result.socketId) {
        fastify.io.to(result.socketId).to(ManagerRoom).emit('payment', result.orders);
      } else {
        fastify.io.to(ManagerRoom).emit('payment', result.orders);
      }
      reply.send({
        message: `Thanh toán thành công ${result.orders.length} đơn`,
        data: result.orders
      });
    }
  );
}
