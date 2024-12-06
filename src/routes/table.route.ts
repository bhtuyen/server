import { createTable, deleteTable, getTableDetail, getTableList, updateTable } from '@/controllers/table.controller';
import { pauseApiHook, requireEmployeeHook, requireLoginedHook, requireOwnerHook } from '@/hooks/auth.hooks';
import type { CreateTable, TableParam, TableRes, TablesRes, UpdateTable } from '@/schemaValidations/table.schema';
import { tableParam, tableRes, tablesRes } from '@/schemaValidations/table.schema';
import type { FastifyInstance, FastifyPluginOptions } from 'fastify';

export default async function tablesRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
  /**
   * @description get tables
   * @buihuytuyen
   */
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
      const tables = await getTableList();
      reply.send({
        data: tables,
        message: 'Lấy danh sách bàn thành công!'
      });
    }
  );

  /**
   * @description get table by number
   * @buihuytuyen
   */
  fastify.get<{
    Params: TableParam;
    Reply: TableRes;
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
      const table = await getTableDetail(request.params.number);
      reply.send({
        data: table,
        message: 'Lấy thông tin bàn thành công!'
      });
    }
  );

  /**
   * @description create table
   * @buihuytuyen
   */
  fastify.post<{
    Body: CreateTable;
    Reply: TableRes;
  }>(
    '',
    {
      schema: {
        body: createTable,
        response: {
          200: tableRes
        }
      },
      /**
       * Login AND (Owner OR Employee) AND Pause API
       */
      preValidation: fastify.auth([requireLoginedHook, pauseApiHook, [requireOwnerHook, requireEmployeeHook]], {
        relation: 'and'
      })
    },
    async (request, reply) => {
      const table = await createTable(request.body);
      reply.send({
        data: table,
        message: 'Tạo bàn thành công!'
      });
    }
  );

  /**
   * @description update table
   * @buihuytuyen
   */
  fastify.put<{
    Params: TableParam;
    Body: UpdateTable;
    Reply: TableRes;
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
      /**
       * Login AND (Owner OR Employee) AND Pause API
       */
      preValidation: fastify.auth([pauseApiHook, requireLoginedHook, [requireOwnerHook, requireEmployeeHook]], {
        relation: 'and'
      })
    },
    async (request, reply) => {
      const table = await updateTable(request.params.number, request.body);
      reply.send({
        data: table,
        message: 'Cập nhật bàn thành công!'
      });
    }
  );

  /**
   * @description delete table
   * @buihuytuyen
   */
  fastify.delete<{
    Params: TableParam;
    Reply: TableRes;
  }>(
    '/:number',
    {
      schema: {
        params: tableParam,
        response: {
          200: tableRes
        }
      },
      /**
       * Login AND (Owner OR Employee) AND Pause API
       */
      preValidation: fastify.auth([pauseApiHook, requireLoginedHook, [requireOwnerHook, requireEmployeeHook]], {
        relation: 'and'
      })
    },
    async (request, reply) => {
      const table = await deleteTable(request.params.number);
      reply.send({
        message: 'Xóa bàn thành công!',
        data: table
      });
    }
  );
}
