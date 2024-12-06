import {
  changePassword,
  changePasswordV2,
  createEmployee,
  deleteEmployee,
  getAccounts,
  getEmployee,
  getMe,
  updateEmployee,
  updateMe
} from '@/controllers/account.controller';
import { pauseApiHook, requireLoginedHook, requireOwnerHook } from '@/hooks/auth.hooks';
import type {
  AccountRes,
  AccountsRes,
  ChangePassword,
  CreateEmployee,
  UpdateEmployee,
  UpdateMe
} from '@/schemaValidations/account.schema';
import { accountRes, accountsRes } from '@/schemaValidations/account.schema';
import type { LoginRes } from '@/schemaValidations/auth.schema';
import { loginRes } from '@/schemaValidations/auth.schema';
import type { IdParam } from '@/schemaValidations/common.schema';
import { idParam } from '@/schemaValidations/common.schema';
import type { FastifyInstance, FastifyPluginOptions } from 'fastify';

export default async function accountRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
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
      const accounts = await getAccounts();
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
      const account = await createEmployee(request.body);
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
      const account = await getEmployee(accountId);
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
      const { account, socketId, isChangeRole } = await updateEmployee(accountId, body);
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
      const { account, socketId } = await deleteEmployee(accountId);
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
  fastify.get<{ Reply: AccountRes }>(
    '/me',
    {
      schema: {
        response: {
          200: accountRes
        }
      }
    },
    async (request, reply) => {
      const account = await getMe(request.decodedAccessToken!.userId);
      reply.send({
        data: account,
        message: 'Lấy thông tin thành công'
      });
    }
  );

  /**
   * @description Update me
   * @buihuytuyen
   */
  fastify.put<{
    Reply: AccountRes;
    Body: UpdateMe;
  }>(
    '/me',
    {
      schema: {
        response: {
          200: accountRes
        },
        body: updateMe
      },
      preValidation: fastify.auth([pauseApiHook])
    },
    async (request, reply) => {
      const result = await updateMe(request.decodedAccessToken!.userId, request.body);
      reply.send({
        data: result,
        message: 'Cập nhật thông tin thành công'
      });
    }
  );

  /**
   * @description Change password
   * @buihuytuyen
   */
  fastify.put<{
    Reply: AccountRes;
    Body: ChangePassword;
  }>(
    '/change-password',
    {
      schema: {
        response: {
          200: accountRes
        },
        body: changePassword
      },
      preValidation: fastify.auth([pauseApiHook])
    },
    async (request, reply) => {
      const result = await changePassword(request.decodedAccessToken!.userId, request.body);
      reply.send({
        data: result,
        message: 'Đổi mật khẩu thành công'
      });
    }
  );

  /**
   * @description Change password v2
   * @buihuytuyen
   */
  fastify.put<{
    Reply: LoginRes;
    Body: ChangePassword;
  }>(
    '/change-password-v2',
    {
      schema: {
        response: {
          200: loginRes
        },
        body: changePassword
      },
      preValidation: fastify.auth([pauseApiHook])
    },
    async (request, reply) => {
      const result = await changePasswordV2(request.decodedAccessToken!.userId, request.body);
      reply.send({
        data: result,
        message: 'Đổi mật khẩu thành công'
      });
    }
  );
}
