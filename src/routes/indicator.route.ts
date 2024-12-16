import type { Period } from '@/schemaValidations/common.schema';
import type { DashboardIndicatorRes } from '@/schemaValidations/indicator.schema';
import type { FastifyInstance } from 'fastify';

import indicatorController from '@/controllers/indicator.controller';
import { requireEmployeeHook, requireLoginedHook, requireOwnerHook } from '@/hooks/auth.hooks';
import { period } from '@/schemaValidations/common.schema';
import { dashboardIndicatorRes } from '@/schemaValidations/indicator.schema';

export default async function indicatorRoutes(fastify: FastifyInstance) {
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
   * @description Get dashboard indicators
   * @buihuytuyen
   */
  fastify.get<{ Reply: DashboardIndicatorRes; Querystring: Period }>(
    '/dashboard',
    {
      schema: {
        response: {
          200: dashboardIndicatorRes
        },
        querystring: period
      }
    },
    async (request, reply) => {
      const queryString = request.query;
      const result = await indicatorController.dashboardIndicatorController(queryString);
      reply.send({
        message: 'Lấy các chỉ số thành công',
        data: result
      });
    }
  );
}
