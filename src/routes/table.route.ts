import { createTable, deleteTable, getTableDetail, getTableList, updateTable } from '@/controllers/table.controller';
import { pauseApiHook, requireEmployeeHook, requireLoginedHook, requireOwnerHook } from '@/hooks/auth.hooks';
import {
  CreateTable,
  tableParam,
  TableParam,
  tableRes,
  TableResType,
  TablesRes,
  tablesRes,
  UpdateTable
} from '@/schemaValidations/table.schema';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';

export default async function tablesRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
  fastify.get<{
    Reply: TablesRes;
  }>(
    '/',
    {
      schema: {
        response: {
          200: tablesRes
        }
      }
    },
    async (request, reply) => {
      const Tables = await getTableList();
      reply.send({
        data: Tables as TablesRes['data'],
        message: 'Lấy danh sách bàn thành công!'
      });
    }
  );

  fastify.get<{
    Params: TableParam;
    Reply: TableResType;
  }>(
    '/:number',
    {
      schema: {
        params: tableParam,
        response: {
          200: tableRes
        }
      }
    },
    async (request, reply) => {
      const Table = await getTableDetail(request.params.number);
      reply.send({
        data: Table as TableResType['data'],
        message: 'Lấy thông tin bàn thành công!'
      });
    }
  );

  fastify.post<{
    Body: CreateTable;
    Reply: TableResType;
  }>(
    '',
    {
      schema: {
        body: createTable,
        response: {
          200: tableRes
        }
      },
      preValidation: fastify.auth([requireLoginedHook, pauseApiHook, [requireOwnerHook, requireEmployeeHook]], {
        relation: 'and'
      })
    },
    async (request, reply) => {
      const Table = await createTable(request.body);
      reply.send({
        data: Table as TableResType['data'],
        message: 'Tạo bàn thành công!'
      });
    }
  );

  fastify.put<{
    Params: TableParam;
    Body: UpdateTable;
    Reply: TableResType;
  }>(
    '/:number',
    {
      schema: {
        params: tableParam,
        body: updateTable,
        response: {
          200: tableRes
        }
      },
      preValidation: fastify.auth([pauseApiHook, requireLoginedHook, [requireOwnerHook, requireEmployeeHook]], {
        relation: 'and'
      })
    },
    async (request, reply) => {
      const Table = await updateTable(request.params.number, request.body);
      reply.send({
        data: Table as TableResType['data'],
        message: 'Cập nhật bàn thành công!'
      });
    }
  );

  fastify.delete<{
    Params: TableParam;
    Reply: TableResType;
  }>(
    '/:number',
    {
      schema: {
        params: tableParam,
        response: {
          200: tableRes
        }
      },
      preValidation: fastify.auth([pauseApiHook, requireLoginedHook, [requireOwnerHook, requireEmployeeHook]], {
        relation: 'and'
      })
    },
    async (request, reply) => {
      const result = await deleteTable(request.params.number);
      reply.send({
        message: 'Xóa bàn thành công!',
        data: result as TableResType['data']
      });
    }
  );
}
