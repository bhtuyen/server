import { dashboardIndicatorController } from '@/controllers/indicator.controller';
import { requireEmployeeHook, requireLoginedHook, requireOwnerHook } from '@/hooks/auth.hooks';
import {
  DashboardIndicatorQuery,
  dashboardIndicatorQuerySchema,
  DashboardIndicatorRes,
  dashboardIndicatorResSchema
} from '@/schemaValidations/indicator.schema';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';

export default async function indicatorRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
  fastify.addHook(
    'preValidation',
    fastify.auth([requireLoginedHook, [requireOwnerHook, requireEmployeeHook]], {
      relation: 'and'
    })
  );
  fastify.get<{ Reply: DashboardIndicatorRes; Querystring: DashboardIndicatorQuery }>(
    '/dashboard',
    {
      schema: {
        response: {
          200: dashboardIndicatorResSchema
        },
        querystring: dashboardIndicatorQuerySchema
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
