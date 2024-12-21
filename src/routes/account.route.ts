import type { AccountRes, AccountsRes, ChangePassword, CreateEmployee, UpdateEmployee, UpdateMe } from '@/schemaValidations/account.schema';
import type { LoginRes } from '@/schemaValidations/auth.schema';
import type { IdParam, MessageRes } from '@/schemaValidations/common.schema';
import type { FastifyInstance } from 'fastify';

import { GuestOrderRole } from '@/constants/const';
import accountController from '@/controllers/account.controller';
import { pauseApiHook, requireLoginedHook, requireOwnerHook } from '@/hooks/auth.hooks';
import { accountRes, accountsRes, changePassword, createEmployee, updateEmployee, updateMe } from '@/schemaValidations/account.schema';
import { loginRes } from '@/schemaValidations/auth.schema';
import { idParam, messageRes } from '@/schemaValidations/common.schema';

export default async function accountRoutes(fastify: FastifyInstance) {
  /**
   * @description Require logined hook
   * @buihuytuyen
   */
  fastify.addHook('preValidation', fastify.auth([requireLoginedHook]));

  /**
   * @description Get accounts
   * @buihuytuyen
   */
  fastify.get<{ Reply: AccountsRes }>(
    '/',
    {
      schema: {
        response: {
          200: accountsRes
        }
      },
      preValidation: fastify.auth([requireOwnerHook])
    },
    async (request, reply) => {
      const accounts = await accountController.getAccounts();
      reply.send({
        data: accounts,
        message: 'Lấy danh sách nhân viên thành công'
      });
    }
  );

  /**
   * @description Create employee
   * @buihuytuyen
   */
  fastify.post<{
    Body: CreateEmployee;
    Reply: AccountRes;
  }>(
    '/',
    {
      schema: {
        response: {
          200: accountRes
        },
        body: createEmployee
      },
      preValidation: fastify.auth([requireOwnerHook, pauseApiHook])
    },
    async (request, reply) => {
      const account = await accountController.createEmployee(request.body);
      reply.send({
        data: account,
        message: 'Tạo tài khoản thành công'
      });
    }
  );

  /**
   * @description Get employee
   * @buihuytuyen
   */
  fastify.get<{ Reply: AccountRes; Params: IdParam }>(
    '/detail/:id',
    {
      schema: {
        response: {
          200: accountRes
        },
        params: idParam
      },
      preValidation: fastify.auth([requireOwnerHook])
    },
    async (request, reply) => {
      const accountId = request.params.id;
      const account = await accountController.getEmployee(accountId);
      reply.send({
        data: account,
        message: 'Lấy thông tin nhân viên thành công'
      });
    }
  );

  /**
   * @description Update employee
   * @buihuytuyen
   */
  fastify.put<{ Reply: AccountRes; Params: IdParam; Body: UpdateEmployee }>(
    '/detail/:id',
    {
      schema: {
        response: {
          200: accountRes
        },
        params: idParam,
        body: updateEmployee
      },
      preValidation: fastify.auth([requireOwnerHook, pauseApiHook])
    },
    async (request, reply) => {
      const accountId = request.params.id;
      const body = request.body;
      const { account, socketId, isChangeRole } = await accountController.updateEmployee({ ...body, id: accountId });
      if (isChangeRole && socketId) {
        fastify.io.to(socketId).emit('refresh-token', account);
      }
      reply.send({
        data: account,
        message: 'Cập nhật thành công'
      });
    }
  );

  /**
   * @description Delete employee
   * @buihuytuyen
   */
  fastify.delete<{ Reply: AccountRes; Params: IdParam }>(
    '/detail/:id',
    {
      schema: {
        response: {
          200: accountRes
        },
        params: idParam
      },
      preValidation: fastify.auth([requireOwnerHook, pauseApiHook])
    },
    async (request, reply) => {
      const accountId = request.params.id;
      const { account, socketId } = await accountController.deleteEmployee(accountId);
      if (socketId) {
        fastify.io.to(socketId).emit('logout', account);
      }
      reply.send({
        data: account,
        message: 'Xóa thành công'
      });
    }
  );

  /**
   * @description Get me
   * @buihuytuyen
   */
  fastify.get<{
    Reply: {
      200: AccountRes;
      400: MessageRes;
    };
  }>(
    '/me',
    {
      schema: {
        response: {
          200: accountRes,
          400: messageRes
        }
      }
    },
    async ({ decodedAccessToken }, reply) => {
      if (decodedAccessToken && !(decodedAccessToken.role === GuestOrderRole)) {
        const { accountId } = decodedAccessToken;
        const account = await accountController.getMe(accountId);
        reply.status(200).send({
          data: account,
          message: 'Lấy thông tin thành công'
        });
      }

      reply.status(400).send({
        message: 'Bạn không có quyền lấy thông tin'
      });
    }
  );

  /**
   * @description Update me
   * @buihuytuyen
   */
  fastify.put<{
    Reply: {
      200: AccountRes;
      400: MessageRes;
    };
    Body: UpdateMe;
  }>(
    '/me',
    {
      schema: {
        response: {
          200: accountRes,
          400: messageRes
        },
        body: updateMe
      },
      preValidation: fastify.auth([pauseApiHook])
    },
    async ({ decodedAccessToken, body }, reply) => {
      if (decodedAccessToken && !(decodedAccessToken.role === GuestOrderRole)) {
        const { accountId } = decodedAccessToken;
        const result = await accountController.updateMe(accountId, body);
        reply.status(200).send({
          data: result,
          message: 'Cập nhật thông tin thành công'
        });
      }

      reply.status(400).send({
        message: 'Bạn không có quyền cập nhật thông tin'
      });
    }
  );

  /**
   * @description Change password
   * @buihuytuyen
   */
  fastify.put<{
    Reply: {
      200: AccountRes;
      400: MessageRes;
    };
    Body: ChangePassword;
  }>(
    '/change-password',
    {
      schema: {
        response: {
          200: accountRes,
          400: messageRes
        },
        body: changePassword
      },
      preValidation: fastify.auth([pauseApiHook])
    },
    async ({ decodedAccessToken, body }, reply) => {
      if (decodedAccessToken && !(decodedAccessToken.role === GuestOrderRole)) {
        const { accountId } = decodedAccessToken;
        const result = await accountController.changePassword(accountId, body);
        reply.status(200).send({
          data: result,
          message: 'Đổi mật khẩu thành công'
        });
      }

      reply.status(400).send({
        message: 'Bạn không có quyền đổi mật khẩu'
      });
    }
  );

  /**
   * @description Change password v2
   * @buihuytuyen
   */
  fastify.put<{
    Reply: {
      200: LoginRes;
      400: MessageRes;
    };
    Body: ChangePassword;
  }>(
    '/change-password-v2',
    {
      schema: {
        response: {
          200: loginRes,
          400: messageRes
        },
        body: changePassword
      },
      preValidation: fastify.auth([pauseApiHook])
    },
    async ({ decodedAccessToken, body }, reply) => {
      if (decodedAccessToken && !(decodedAccessToken.role === GuestOrderRole)) {
        const { accountId } = decodedAccessToken;
        const result = await accountController.changePasswordV2(accountId, body);
        reply.status(200).send({
          data: result,
          message: 'Đổi mật khẩu thành công'
        });
      }

      reply.status(400).send({
        message: 'Bạn không có quyền đổi mật khẩu'
      });
    }
  );
}
