import envConfig from '@/config';
import fastifyStatic from '@fastify/static';
import type { FastifyInstance, FastifyPluginOptions } from 'fastify';
import path from 'path';

export default async function staticRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
  /**
   * @description Serve static files
   * @buihuytuyen
   */
  fastify.register(fastifyStatic, {
    root: path.resolve(envConfig.UPLOAD_FOLDER)
  });

  /**
   * @description Get static file
   * @buihuytuyen
   */
  fastify.get<{
    Params: {
      id: string;
    };
  }>('/static/:id', async (request, reply) => {
    return reply.sendFile(request.params.id);
  });
}
