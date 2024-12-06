import { dashboardIndicatorController } from '@/controllers/indicator.controller';
import { requireEmployeeHook, requireLoginedHook, requireOwnerHook } from '@/hooks/auth.hooks';
import type { Period } from '@/schemaValidations/common.schema';
import { period } from '@/schemaValidations/common.schema';
import type { DashboardIndicatorRes } from '@/schemaValidations/indicator.schema';
import { dashboardIndicatorRes } from '@/schemaValidations/indicator.schema';
import type { FastifyInstance, FastifyPluginOptions } from 'fastify';

export default async function indicatorRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
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
      const result = await dashboardIndicatorController(queryString);
      reply.send({
        message: 'Lấy các chỉ số thành công',
        data: result
      });
    }
  );
}
