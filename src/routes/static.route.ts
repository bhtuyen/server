import fastifyStatic from '@fastify/static';
import path from 'path';

import type { FastifyInstance } from 'fastify';

import envConfig from '@/config';

export default async function staticRoutes(fastify: FastifyInstance) {
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
