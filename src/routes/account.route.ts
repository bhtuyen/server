import {
  changePasswordController,
  changePasswordV2Controller,
  createEmployeeAccount,
  createGuestController,
  deleteEmployeeAccount,
  getAccountList,
  getEmployeeAccount,
  getGuestList,
  getMeController,
  updateEmployeeAccount,
  updateMeController
} from '@/controllers/account.controller';
import { pauseApiHook, requireEmployeeHook, requireLoginedHook, requireOwnerHook } from '@/hooks/auth.hooks';
import type {
  AccountIdParam,
  AccountRes,
  AccountsRes,
  ChangePassword,
  CreateEmployee,
  CreateGuestBodyType,
  CreateGuestResType,
  GetGuestListQueryParamsType,
  GetListGuestsResType,
  UpdateEmployee,
  UpdateMe
} from '@/schemaValidations/account.schema';
import {
  accountIdParamSchema,
  accountRes,
  accountsRes,
  changePasswordSchema,
  createEmployee,
  CreateGuestBody,
  CreateGuestRes,
  GetGuestListQueryParams,
  GetListGuestsRes,
  updateEmployee,
  updateMeSchema
} from '@/schemaValidations/account.schema';
import { loginRes } from '@/schemaValidations/auth.schema';
import { Role } from '@prisma/client';
import type { FastifyInstance, FastifyPluginOptions } from 'fastify';

export default async function accountRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
  fastify.addHook('preValidation', fastify.auth([requireLoginedHook]));
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
      const accounts = await getAccountList();
      reply.send({
        data: accounts,
        message: 'Lấy danh sách nhân viên thành công'
      });
    }
  );
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
      const account = await createEmployeeAccount(request.body);
      reply.send({
        data: account as AccountRes['data'],
        message: 'Tạo tài khoản thành công'
      });
    }
  );
  fastify.get<{ Reply: AccountRes; Params: AccountIdParam }>(
    '/detail/:id',
    {
      schema: {
        response: {
          200: accountRes
        },
        params: accountIdParamSchema
      },
      preValidation: fastify.auth([requireOwnerHook])
    },
    async (request, reply) => {
      const accountId = request.params.id;
      const account = await getEmployeeAccount(accountId);
      reply.send({
        data: account as AccountRes['data'],
        message: 'Lấy thông tin nhân viên thành công'
      });
    }
  );

  fastify.put<{ Reply: AccountRes; Params: AccountIdParam; Body: UpdateEmployee }>(
    '/detail/:id',
    {
      schema: {
        response: {
          200: accountRes
        },
        params: accountIdParamSchema,
        body: updateEmployee
      },
      preValidation: fastify.auth([requireOwnerHook, pauseApiHook])
    },
    async (request, reply) => {
      const accountId = request.params.id;
      const body = request.body;
      const { account, socketId, isChangeRole } = await updateEmployeeAccount(accountId, body);
      if (isChangeRole && socketId) {
        fastify.io.to(socketId).emit('refresh-token', account);
      }
      reply.send({
        data: account as AccountRes['data'],
        message: 'Cập nhật thành công'
      });
    }
  );

  fastify.delete<{ Reply: AccountRes; Params: AccountIdParam }>(
    '/detail/:id',
    {
      schema: {
        response: {
          200: accountRes
        },
        params: accountIdParamSchema
      },
      preValidation: fastify.auth([requireOwnerHook, pauseApiHook])
    },
    async (request, reply) => {
      const accountId = request.params.id;
      const { account, socketId } = await deleteEmployeeAccount(accountId);
      if (socketId) {
        fastify.io.to(socketId).emit('logout', account);
      }
      reply.send({
        data: account as AccountRes['data'],
        message: 'Xóa thành công'
      });
    }
  );

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
      const account = await getMeController(request.decodedAccessToken!.userId);
      reply.send({
        data: account as AccountRes['data'],
        message: 'Lấy thông tin thành công'
      });
    }
  );

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
        body: updateMeSchema
      },
      preValidation: fastify.auth([pauseApiHook])
    },
    async (request, reply) => {
      const result = await updateMeController(request.decodedAccessToken!.userId, request.body);
      reply.send({
        data: result as AccountRes['data'],
        message: 'Cập nhật thông tin thành công'
      });
    }
  );

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
        body: changePasswordSchema
      },
      preValidation: fastify.auth([pauseApiHook])
    },
    async (request, reply) => {
      const result = await changePasswordController(request.decodedAccessToken!.userId, request.body);
      reply.send({
        data: result as AccountRes['data'],
        message: 'Đổi mật khẩu thành công'
      });
    }
  );

  fastify.put<{
    Reply: ChangePassword;
    Body: ChangePassword;
  }>(
    '/change-password-v2',
    {
      schema: {
        response: {
          200: loginRes
        },
        body: changePasswordSchema
      },
      preValidation: fastify.auth([pauseApiHook])
    },
    async (request, reply) => {
      const result = await changePasswordV2Controller(request.decodedAccessToken!.userId, request.body);
      reply.send({
        data: result,
        message: 'Đổi mật khẩu thành công'
      });
    }
  );

  fastify.post<{ Reply: CreateGuestResType; Body: CreateGuestBodyType }>(
    '/guests',
    {
      schema: {
        response: {
          200: CreateGuestRes
        },
        body: CreateGuestBody
      },
      preValidation: fastify.auth([requireOwnerHook, requireEmployeeHook], {
        relation: 'or'
      })
    },
    async (request, reply) => {
      const result = await createGuestController(request.body);
      reply.send({
        message: 'Tạo tài khoản khách thành công',
        data: { ...result, role: Role.Guest }
      });
    }
  );

  /**
   *
   */
  fastify.get<{ Reply: GetListGuestsResType; Querystring: GetGuestListQueryParamsType }>(
    '/guests',
    {
      schema: {
        response: {
          200: GetListGuestsRes
        },
        querystring: GetGuestListQueryParams
      },
      preValidation: fastify.auth([requireOwnerHook, requireEmployeeHook], {
        relation: 'or'
      })
    },
    async (request, reply) => {
      const result = await getGuestList({
        fromDate: request.query.fromDate,
        toDate: request.query.toDate
      });
      reply.send({
        message: 'Lấy danh sách khách thành công',
        data: result
      });
    }
  );
}
