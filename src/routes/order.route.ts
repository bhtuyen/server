import type { IdParam, Period } from '@/schemaValidations/common.schema';
import type {
  CreateOrders,
  GuestPayOrders,
  OrderDtoDetailRes,
  OrdersDtoDetailRes,
  TableNumberParam,
  UpdateOrder
} from '@/schemaValidations/order.schema';
import type { FastifyInstance } from 'fastify';

import { ManagerRoom } from '@/constants/const';
import orderController from '@/controllers/order.controller';
import { requireEmployeeHook, requireGuestHook, requireLoginedHook, requireOwnerHook } from '@/hooks/auth.hooks';
import { idParam, period } from '@/schemaValidations/common.schema';
import { createOrders, payOrders, orderDtoDetailRes, ordersDtoDetailRes, updateOrder, tableNumberParam } from '@/schemaValidations/order.schema';

export default async function orderRoutes(fastify: FastifyInstance) {
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
      }
    },
    async (request, reply) => {
      const { socketId, orders } = await orderController.creates(request.decodedAccessToken!.userId, request.body);
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
      preValidation: fastify.auth([requireLoginedHook, requireGuestHook])
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
      }
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
      }
    },
    async (request, reply) => {
      const result = await orderController.update({ ...request.body, id: request.params.id });
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
   * @description Pay orders for table
   * @buihuytuyen
   */
  fastify.post<{ Body: GuestPayOrders; Reply: OrdersDtoDetailRes }>(
    '/pay',
    {
      schema: {
        response: {
          200: ordersDtoDetailRes
        },
        body: payOrders
      }
    },
    async (request, reply) => {
      const result = await orderController.payForTable({
        tableNumber: request.body.tableNumber,
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
