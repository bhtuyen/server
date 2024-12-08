import mediaController from '@/controllers/media.controller';
import { pauseApiHook, requireEmployeeHook, requireLoginedHook, requireOwnerHook } from '@/hooks/auth.hooks';
import type { UploadImageRes } from '@/schemaValidations/media.schema';
import { uploadImageRes } from '@/schemaValidations/media.schema';
import fastifyMultipart from '@fastify/multipart';
import type { FastifyInstance, FastifyPluginOptions } from 'fastify';

export default async function mediaRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
  /**
   * @description register fastify-multipart
   * @buihuytuyen
   */
  fastify.register(fastifyMultipart);

  /**
   * @description Require logined hook, require owner or employee hook, pause api hook
   * @buihuytuyen
   */
  fastify.addHook(
    'preValidation',
    fastify.auth([requireLoginedHook, pauseApiHook, [requireOwnerHook, requireEmployeeHook]], {
      relation: 'and'
    })
  );

  /**
   * @description Upload image
   * @buihuytuyen
   */
  fastify.post<{
    Reply: UploadImageRes;
  }>(
    '/upload',
    {
      schema: {
        response: {
          200: uploadImageRes
        }
      }
    },
    async (request, reply) => {
      const data = await request.file({
        limits: {
          fileSize: 1024 * 1024 * 10, // 10MB,
          fields: 1,
          files: 1
        }
      });
      if (!data) {
        throw new Error('Không tìm thấy file');
      }
      const url = await mediaController.uploadImage(data);
      return reply.send({ message: 'Upload ảnh thành công', data: url });
    }
  );
}
