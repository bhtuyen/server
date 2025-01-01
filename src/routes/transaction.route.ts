import type { FastifyInstance } from 'fastify';

import { ManagerRoom } from '@/constants/const';
import transactionController from '@/controllers/transaction.controller';
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
          201: transactionWebhookRes
        }
      }
    },
    async (request, reply) => {
      const success = await transactionController.webhook(request.body);
      if (success) {
        fastify.io.to(ManagerRoom).emit('payment');
        reply.status(201).send({
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
