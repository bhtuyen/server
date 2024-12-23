import type { IdParam } from '@/schemaValidations/common.schema';
import type { TableDtoDetailRes, TableNumberParam } from '@/schemaValidations/order.schema';
import type { CreateTable, TableRes, TablesRes, UpdateTable } from '@/schemaValidations/table.schema';
import type { FastifyInstance } from 'fastify';

import tableController from '@/controllers/table.controller';
import { pauseApiHook, requireEmployeeHook, requireLoginedHook, requireOwnerHook } from '@/hooks/auth.hooks';
import { idParam } from '@/schemaValidations/common.schema';
import { tableDtoDetailRes, tableDtoDetailsRes, tableNumberParam, type TableDtoDetailsRes } from '@/schemaValidations/order.schema';
import { createTable, tableRes, tablesRes, updateTable } from '@/schemaValidations/table.schema';

export default async function tablesRoutes(fastify: FastifyInstance) {
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
      const tables = await tableController.getTableList();
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
    Params: IdParam;
    Reply: TableRes;
  }>(
    '/:id',
    {
      schema: {
        params: idParam,
        response: {
          200: tableRes
        }
      }
    },
    async (request, reply) => {
      const table = await tableController.getTableDetail(request.params.id);
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
      const table = await tableController.createTable(request.body);
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
    Params: IdParam;
    Body: UpdateTable;
    Reply: TableRes;
  }>(
    '/:id',
    {
      schema: {
        params: idParam,
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
      const table = await tableController.updateTable({ ...request.body, id: request.params.id });
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
    Params: IdParam;
    Reply: TableRes;
  }>(
    '/:id',
    {
      schema: {
        params: idParam,
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
      const table = await tableController.deleteTable(request.params.id);
      reply.send({
        message: 'Xóa bàn thành công!',
        data: table
      });
    }
  );

  /**
   * @description get tables detail now
   * @buihuytuyen
   */
  fastify.get<{
    Reply: TableDtoDetailRes;
    Params: TableNumberParam;
  }>(
    '/detail-now/:tableNumber',
    {
      schema: {
        params: tableNumberParam,
        response: {
          200: tableDtoDetailRes
        }
      }
    },
    async (request, reply) => {
      const tableNumber = request.params.tableNumber;
      const table = await tableController.getTableDetailNow(tableNumber);
      reply.send({
        data: table,
        message: 'Lấy thông tin bàn thành công!'
      });
    }
  );

  /**
   * @description get tables detail now
   * @buihuytuyen
   */
  fastify.get<{
    Reply: TableDtoDetailsRes;
  }>(
    '/detail-now',
    {
      schema: {
        response: {
          200: tableDtoDetailsRes
        }
      }
    },
    async (_, reply) => {
      const tables = await tableController.getTablesDetailNow();
      reply.send({
        data: tables,
        message: 'Lấy danh sách bàn thành công!'
      });
    }
  );
}
