import {
  createDish,
  createDishGroup,
  deleteDish,
  getDish,
  getDishes,
  getDishGroupList,
  updateDish
} from '@/controllers/dish.controller';
import { pauseApiHook, requireEmployeeHook, requireLoginedHook, requireOwnerHook } from '@/hooks/auth.hooks';
import type { IdParam } from '@/schemaValidations/common.schema';
import type {
  CreateDish,
  CreateDishGroup,
  DishesRes,
  DishGroupRes,
  DishGroupsRes,
  DishRes,
  UpdateDish
} from '@/schemaValidations/dish.schema';
import { dishesRes, dishGroupRes, dishGroupsRes, dishParams, dishRes } from '@/schemaValidations/dish.schema';
import type { FastifyInstance, FastifyPluginOptions } from 'fastify';

export default async function dishRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
  /**
   * @description Get dishes
   * @buihuytuyen
   */
  fastify.get<{
    Reply: DishesRes;
  }>(
    '/',
    {
      schema: {
        response: {
          200: dishesRes
        }
      }
    },
    async (request, reply) => {
      const data = await getDishes();

      reply.send({
        data,
        message: 'Lấy danh sách món ăn thành công!'
      });
    }
  );

  /**
   * @description Get dish by id
   * @buihuytuyen
   */
  fastify.get<{
    Params: IdParam;
    Reply: DishRes;
  }>(
    '/:id',
    {
      schema: {
        params: dishParams,
        response: {
          200: dishRes
        }
      }
    },
    async (request, reply) => {
      const data = await getDish(request.params.id);

      reply.send({
        data,
        message: 'Lấy thông tin món ăn thành công!'
      });
    }
  );

  /**
   * @description Create dish
   * @buihuytuyen
   */
  fastify.post<{
    Body: CreateDish;
    Reply: DishRes;
  }>(
    '',
    {
      schema: {
        body: createDish,
        response: {
          200: dishRes
        }
      },
      // Login AND (Owner OR Employee)
      preValidation: fastify.auth([requireLoginedHook, pauseApiHook, [requireOwnerHook, requireEmployeeHook]], {
        relation: 'and'
      })
    },
    async (request, reply) => {
      const data = await createDish(request.body);

      reply.send({
        data,
        message: 'Tạo món ăn thành công!'
      });
    }
  );

  /**
   * @description Update dish
   * @buihuytuyen
   */
  fastify.put<{
    Params: IdParam;
    Body: UpdateDish;
    Reply: DishRes;
  }>(
    '/:id',
    {
      schema: {
        params: dishParams,
        body: updateDish,
        response: {
          200: dishRes
        }
      },
      preValidation: fastify.auth([requireLoginedHook, pauseApiHook, [requireOwnerHook, requireEmployeeHook]], {
        relation: 'and'
      })
    },
    async (request, reply) => {
      const data = await updateDish(request.params.id, request.body);
      reply.send({
        data,
        message: 'Cập nhật món ăn thành công!'
      });
    }
  );

  /**
   * @description Delete dish
   * @buihuytuyen
   */
  fastify.delete<{
    Params: IdParam;
    Reply: DishRes;
  }>(
    '/:id',
    {
      schema: {
        params: dishParams,
        response: {
          200: dishRes
        }
      },
      preValidation: fastify.auth([requireLoginedHook, pauseApiHook, [requireOwnerHook, requireEmployeeHook]], {
        relation: 'and'
      })
    },
    async (request, reply) => {
      const data = await deleteDish(request.params.id);
      reply.send({
        message: 'Xóa món ăn thành công!',
        data
      });
    }
  );

  /**
   * @description Get dish groups
   * @buihuytuyen
   */
  fastify.get<{
    Reply: DishGroupsRes;
  }>(
    '/groups',
    {
      schema: {
        response: {
          200: dishGroupsRes
        }
      }
    },
    async (request, reply) => {
      const dishCaregories = await getDishGroupList();
      reply.send({
        data: dishCaregories,
        message: 'Lấy danh sách danh mục món ăn thành công!'
      });
    }
  );

  /**
   * @description Create dish group
   * @buihuytuyen
   */
  fastify.post<{
    Body: CreateDishGroup;
    Reply: DishGroupRes;
  }>(
    '/group',
    {
      schema: {
        body: createDishGroup,
        response: {
          200: dishGroupRes
        }
      },
      // Login AND (Owner OR Employee)
      preValidation: fastify.auth([requireLoginedHook, pauseApiHook, [requireOwnerHook, requireEmployeeHook]], {
        relation: 'and'
      })
    },
    async (request, reply) => {
      const dish = await createDishGroup(request.body);
      reply.send({
        data: dish,
        message: 'Tạo thành công!'
      });
    }
  );
}
