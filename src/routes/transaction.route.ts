import type { FastifyInstance } from 'fastify';

import { ManagerRoom } from '@/constants/const';
import transactionController from '@/controllers/transaction.controller';
import { requiredSePayKeyHook } from '@/hooks/auth.hooks';
import {
  transactionWebhook,
  transactionWebhookRes,
  type TransactionWebhook,
  type TransactionWebhookRes
} from '@/schemaValidations/transaction.schema';

export default async function transactionRoutes(fastify: FastifyInstance) {
  fastify.post<{ Body: TransactionWebhook; Reply: TransactionWebhookRes }>(
    '/webhook',
    {
      schema: {
        body: transactionWebhook,
        response: {
          200: transactionWebhookRes
        }
      },
      preHandler: fastify.auth([requiredSePayKeyHook])
    },
    async (request, reply) => {
      const { success, tableNumber } = await transactionController.webhook(request.body);
      if (success) {
        fastify.io.to(ManagerRoom).emit('payment', tableNumber);
        reply.status(200).send({
          message: 'Nhận thông tin giao dịch thành công!',
          success
        });
      } else {
        reply.status(400).send({
          message: 'Giao dịch không tồn tại!',
          success
        });
      }
    }
  );
}
