import type {
  CreateDishCombo,
  CreateDishGroup,
  DishDtoComboDetailRes,
  DishDtoComboDetailsRes,
  DishDtoDetailChooseRes,
  DishesRes,
  DishGroupRes,
  DishGroupsRes,
  DishRes,
  DishToChoose,
  UpdateDishCombo
} from '@/schemaValidations/dish.schema';
import type { FastifyInstance } from 'fastify';

import dishController from '@/controllers/dish.controller';
import { pauseApiHook, requireEmployeeHook, requireLoginedHook, requireOwnerHook } from '@/hooks/auth.hooks';
import { idParam, type IdParam } from '@/schemaValidations/common.schema';
import {
  createDishCombo,
  createDishGroup,
  dishDtoComboDetailRes,
  dishDtoComboDetailsRes,
  dishDtoDetailChooseRes,
  dishesRes,
  dishGroupRes,
  dishGroupsRes,
  dishRes,
  dishToChoose,
  updateDishCombo
} from '@/schemaValidations/dish.schema';

export default async function dishRoutes(fastify: FastifyInstance) {
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
    async (_, reply) => {
      const data = await dishController.getDishes();

      reply.send({
        data,
        message: 'Lấy danh sách món ăn thành công!'
      });
    }
  );

  /**
   * @description Get dishes by category
   * @buihuytuyen
   */
  fastify.post<{
    Body: DishToChoose;
    Reply: DishDtoDetailChooseRes;
  }>(
    '/choose',
    {
      schema: {
        body: dishToChoose,
        response: {
          200: dishDtoDetailChooseRes
        }
      }
    },
    async (request, reply) => {
      const data = await dishController.getToChoose(request.body);

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
    Reply: DishDtoComboDetailRes;
  }>(
    '/:id',
    {
      schema: {
        params: idParam,
        response: {
          200: dishDtoComboDetailRes
        }
      }
    },
    async (request, reply) => {
      const data = await dishController.getDish(request.params.id);

      reply.send({
        data,
        message: 'Lấy thông tin món ăn thành công!'
      });
    }
  );

  /**
   * @description Get dish to order
   * @buihuytuyen
   */
  fastify.get<{
    Reply: DishDtoComboDetailsRes;
  }>(
    '/order',
    {
      schema: {
        response: {
          200: dishDtoComboDetailsRes
        }
      }
    },
    async (_, reply) => {
      const data = await dishController.getDishToOrder();

      reply.send({
        data,
        message: 'Lấy danh sách món ăn thành công!'
      });
    }
  );

  /**
   * @description Get dish to order
   * @buihuytuyen
   */
  fastify.get<{
    Params: IdParam;
    Reply: DishDtoComboDetailsRes;
  }>(
    '/buffet/:id',
    {
      schema: {
        params: idParam,
        response: {
          200: dishDtoComboDetailsRes
        }
      }
    },
    async (request, reply) => {
      const id = request.params.id;
      const data = await dishController.getDishBuffet(id);

      reply.send({
        data,
        message: 'Lấy danh sách món ăn thành công!'
      });
    }
  );

  /**
   * @description Create dish
   * @buihuytuyen
   */
  fastify.post<{
    Body: CreateDishCombo;
    Reply: DishDtoComboDetailRes;
  }>(
    '',
    {
      schema: {
        body: createDishCombo,
        response: {
          200: dishDtoComboDetailRes
        }
      },
      // Login AND (Owner OR Employee)
      preValidation: fastify.auth([requireLoginedHook, pauseApiHook, [requireOwnerHook, requireEmployeeHook]], {
        relation: 'and'
      })
    },
    async (request, reply) => {
      const data = await dishController.createDish(request.body);

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
    Body: UpdateDishCombo;
    Reply: DishDtoComboDetailRes;
  }>(
    '/:id',
    {
      schema: {
        params: idParam,
        body: updateDishCombo,
        response: {
          200: dishDtoComboDetailRes
        }
      },
      preValidation: fastify.auth([requireLoginedHook, pauseApiHook, [requireOwnerHook, requireEmployeeHook]], {
        relation: 'and'
      })
    },
    async (request, reply) => {
      const data = await dishController.updateDish({ ...request.body, id: request.params.id });
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
        params: idParam,
        response: {
          200: dishRes
        }
      },
      preValidation: fastify.auth([requireLoginedHook, pauseApiHook, [requireOwnerHook, requireEmployeeHook]], {
        relation: 'and'
      })
    },
    async (request, reply) => {
      const data = await dishController.deleteDish(request.params.id);
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
    async (_, reply) => {
      const dishCaregories = await dishController.getDishGroupList();
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
      const dish = await dishController.createDishGroup(request.body);
      reply.send({
        data: dish,
        message: 'Tạo thành công!'
      });
    }
  );
}
