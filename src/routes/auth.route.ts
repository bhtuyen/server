import envConfig from '@/config';
import authController from '@/controllers/auth.controller';
import { requireLoginedHook } from '@/hooks/auth.hooks';
import type { Login, LoginGoogle, LoginRes, Logout, RefreshToken, RefreshTokenRes } from '@/schemaValidations/auth.schema';
import { login, loginGoogle, loginRes, logout, refreshToken, refreshTokenRes } from '@/schemaValidations/auth.schema';
import type { MessageRes } from '@/schemaValidations/common.schema';
import { message } from '@/schemaValidations/common.schema';
import type { FastifyInstance, FastifyPluginOptions } from 'fastify';
export default async function authRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
  /**
   * @description Require logined hook
   * @buihuytuyen
   */
  const queryString = (await import('querystring')).default;

  /**
   * @description Đăng xuất
   * @buihuytuyen
   */
  fastify.post<{ Reply: MessageRes; Body: Logout }>(
    '/logout',
    {
      schema: {
        response: {
          200: message
        },
        body: logout
      },
      preValidation: fastify.auth([requireLoginedHook])
    },
    async (request, reply) => {
      const message = await authController.logout(request.body.refreshToken);
      reply.send({
        message
      });
    }
  );

  /**
   * @description Đăng nhập
   * @buihuytuyen
   */
  fastify.post<{ Reply: LoginRes; Body: Login }>(
    '/login',
    {
      schema: {
        response: {
          200: loginRes
        },
        body: login
      }
    },
    async (request, reply) => {
      const { body } = request;
      console.log(body);
      const { accessToken, refreshToken, account } = await authController.login(body);
      reply.send({
        message: 'Đăng nhập thành công',
        data: {
          account,
          accessToken,
          refreshToken
        }
      });
    }
  );

  /**
   * @description Đăng nhập bằng Google
   * @buihuytuyen
   */
  fastify.get<{
    Querystring: LoginGoogle;
  }>(
    '/login/google',
    {
      schema: {
        querystring: loginGoogle
      }
    },
    async (request, reply) => {
      const code = request.query.code;
      try {
        const { accessToken, refreshToken } = await authController.loginGoogle(code);
        const qs = queryString.stringify({
          accessToken,
          refreshToken,
          status: 200
        });
        reply.redirect(`${envConfig.GOOGLE_REDIRECT_CLIENT_URL}?${qs}`);
      } catch (error: any) {
        const { message = 'Lỗi không xác định', status = 500 } = error;
        const qs = queryString.stringify({
          message,
          status
        });
        reply.redirect(`${envConfig.GOOGLE_REDIRECT_CLIENT_URL}?${qs}`);
      }
    }
  );

  /**
   * @description Lấy token mới
   * @buihuytuyen
   */
  fastify.post<{
    Reply: RefreshTokenRes;
    Body: RefreshToken;
  }>(
    '/refresh-token',
    {
      schema: {
        response: {
          200: refreshTokenRes
        },
        body: refreshToken
      }
    },
    async (request, reply) => {
      const result = await authController.refreshToken(request.body.refreshToken);
      reply.send({
        message: 'Lấy token mới thành công',
        data: result
      });
    }
  );
}
