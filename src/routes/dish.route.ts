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
import {
  CreateDish,
  CreateDishGroupBody,
  CreateDishGroupBodyType,
  createDishSchema,
  DishDto,
  DishesRes,
  dishesResSchema,
  DishGroupListRes,
  DishGroupListResType,
  DishGroupRes,
  DishGroupResType,
  DishParams,
  dishParamsSchema,
  DishRes,
  dishResSchema,
  UpdateDish,
  updateDishSchema
} from '@/schemaValidations/dish.schema';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';

export default async function dishRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
  fastify.get<{
    Reply: DishesRes;
  }>(
    '/',
    {
      schema: {
        response: {
          200: dishesResSchema
        }
      }
    },
    async (request, reply) => {
      const data = await getDishes();

      const dishes = data.map<DishDto>((dish) => ({
        ...dish,
        price: Number(dish.price),
        groupName: dish.group.name
      }));

      reply.send({
        data: dishes,
        message: 'Lấy danh sách món ăn thành công!'
      });
    }
  );

  fastify.get<{
    Params: DishParams;
    Reply: DishRes;
  }>(
    '/:id',
    {
      schema: {
        params: dishParamsSchema,
        response: {
          200: dishResSchema
        }
      }
    },
    async (request, reply) => {
      const dish = await getDish(request.params.id);

      reply.send({
        data: {
          ...dish,
          price: Number(dish.price),
          groupName: dish.group.name
        },
        message: 'Lấy thông tin món ăn thành công!'
      });
    }
  );

  fastify.post<{
    Body: CreateDish;
    Reply: DishRes;
  }>(
    '',
    {
      schema: {
        body: createDishSchema,
        response: {
          200: dishResSchema
        }
      },
      // Login AND (Owner OR Employee)
      preValidation: fastify.auth([requireLoginedHook, pauseApiHook, [requireOwnerHook, requireEmployeeHook]], {
        relation: 'and'
      })
    },
    async (request, reply) => {
      const dish = await createDish(request.body);

      reply.send({
        data: {
          ...dish,
          price: Number(dish.price),
          groupName: dish.group.name
        },
        message: 'Tạo món ăn thành công!'
      });
    }
  );

  fastify.put<{
    Params: DishParams;
    Body: UpdateDish;
    Reply: DishRes;
  }>(
    '/:id',
    {
      schema: {
        params: dishParamsSchema,
        body: updateDishSchema,
        response: {
          200: dishResSchema
        }
      },
      preValidation: fastify.auth([requireLoginedHook, pauseApiHook, [requireOwnerHook, requireEmployeeHook]], {
        relation: 'and'
      })
    },
    async (request, reply) => {
      const dish = await updateDish(request.params.id, request.body);
      reply.send({
        data: {
          ...dish,
          price: Number(dish.price),
          groupName: dish.group.name
        },
        message: 'Cập nhật món ăn thành công!'
      });
    }
  );

  fastify.delete<{
    Params: DishParams;
    Reply: DishRes;
  }>(
    '/:id',
    {
      schema: {
        params: dishParamsSchema,
        response: {
          200: dishResSchema
        }
      },
      preValidation: fastify.auth([requireLoginedHook, pauseApiHook, [requireOwnerHook, requireEmployeeHook]], {
        relation: 'and'
      })
    },
    async (request, reply) => {
      const dish = await deleteDish(request.params.id);
      reply.send({
        message: 'Xóa món ăn thành công!',
        data: {
          ...dish,
          price: Number(dish.price),
          groupName: dish.group.name
        }
      });
    }
  );

  fastify.get<{
    Reply: DishGroupListResType;
  }>(
    '/groups',
    {
      schema: {
        response: {
          200: DishGroupListRes
        }
      }
    },
    async (request, reply) => {
      const dishCaregories = await getDishGroupList();
      reply.send({
        data: dishCaregories as DishGroupListResType['data'],
        message: 'Lấy danh sách danh mục món ăn thành công!'
      });
    }
  );

  fastify.post<{
    Body: CreateDishGroupBodyType;
    Reply: DishGroupResType;
  }>(
    '/group',
    {
      schema: {
        body: CreateDishGroupBody,
        response: {
          200: DishGroupRes
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
        data: dish as DishGroupResType['data'],
        message: 'Tạo thành công!'
      });
    }
  );
}
