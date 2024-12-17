import { DishStatus, OrderStatus, TableStatus } from '@prisma/client';

import type { CreateOrders, UpdateOrder } from '@/schemaValidations/order.schema';

import prisma from '@/database';
import { selectOrderDtoDetail } from '@/schemaValidations/order.schema';

class OrderController {
  /**
   * @description Create orders for guest
   * @param orderHandlerId
   * @param body
   * @returns orders list and socketId
   * @buihuytuyen
   */
  creates = async (orderHandlerId: string, body: CreateOrders) => {
    const { tableNumber, orders } = body;

    const table = await prisma.table.findUniqueOrThrow({
      where: {
        number: tableNumber
      }
    });
    if (table.status === TableStatus.Hidden) {
      throw new Error(`Bàn ${table.number} đã bị ẩn, vui lòng chọn khách hàng khác!`);
    }

    const ordersRecord = await prisma.$transaction(async (tx) => {
      const ordersRecord = await Promise.all(
        orders.map(async (order) => {
          const dish = await tx.dish.findUniqueOrThrow({
            where: {
              id: order.dishId
            }
          });
          if (dish.status === DishStatus.Unavailable) {
            throw new Error(`Món ${dish.name} đã hết`);
          }
          if (dish.status === DishStatus.Hidden) {
            throw new Error(`Món ${dish.name} không thể đặt`);
          }
          const dishSnapshot = await tx.dishSnapshot.create({
            data: {
              description: dish.description,
              image: dish.image,
              name: dish.name,
              price: dish.price,
              category: dish.category,
              options: dish.options,
              dishId: dish.id,
              status: dish.status
            }
          });
          const orderRecord = await tx.order.create({
            data: {
              dishSnapshotId: dishSnapshot.id,
              guestId: null,
              quantity: order.quantity,
              tableNumber: tableNumber,
              orderHandlerId,
              status: OrderStatus.Pending,
              options: order.options,
              token: table.token
            },
            select: selectOrderDtoDetail
          });
          return orderRecord;
        })
      );
      return ordersRecord;
    });

    const guestOfTable = await prisma.guest.findFirstOrThrow({
      where: {
        tableNumber,
        token: table.token
      }
    });

    const socketRecord = await prisma.socket.findUnique({
      where: {
        guestId: guestOfTable.id
      }
    });

    return {
      orders: ordersRecord,
      socketId: socketRecord?.socketId
    };
  };

  /**
   * @description Get orders
   * @param fromDate
   * @param toDate
   * @returns orders list by period
   * @buihuytuyen
   */
  getByPeriod = async ({ fromDate, toDate }: { fromDate?: Date; toDate?: Date }) => {
    const orders = await prisma.order.findMany({
      select: selectOrderDtoDetail,
      orderBy: {
        createdAt: 'desc'
      },
      where: {
        createdAt: {
          gte: fromDate,
          lte: toDate
        }
      }
    });
    return orders;
  };

  /**
   * @description Get orders by table
   * @param tableNumber
   * @returns orders list by tableNumber
   * @buihuytuyen
   */
  getByTable = async (tableNumber: string) => {
    const { token } = await prisma.table.findUniqueOrThrow({
      where: {
        number: tableNumber
      }
    });

    const orders = await prisma.order.findMany({
      where: {
        tableNumber,
        token: token
      },
      select: selectOrderDtoDetail,
      orderBy: {
        createdAt: 'desc'
      }
    });

    return orders;
  };

  /**
   * @description Pay orders
   * @param guestId
   * @param orderHandlerId
   * @returns orders list and socketId after paid orders for guest by guestId and orderHandlerId
   * @buihuytuyen
   */
  payForTable = async ({ tableNumber, orderHandlerId }: { tableNumber: string; orderHandlerId: string }) => {
    const { token } = await prisma.table.findUniqueOrThrow({
      where: {
        number: tableNumber
      }
    });
    const orders = await prisma.order.findMany({
      where: {
        tableNumber,
        token,
        status: {
          in: [OrderStatus.Pending, OrderStatus.Processing, OrderStatus.Delivered]
        }
      },
      select: selectOrderDtoDetail
    });
    if (orders.length === 0) {
      throw new Error('Không có hóa đơn nào cần thanh toán');
    }
    await prisma.$transaction(async (tx) => {
      const orderIds = orders.map((order) => order.id);
      const updatedOrders = await tx.order.updateMany({
        where: {
          id: {
            in: orderIds
          }
        },
        data: {
          status: OrderStatus.Paid,
          orderHandlerId
        }
      });
      return updatedOrders;
    });
    const ordersResult = await prisma.order.findMany({
      where: {
        id: {
          in: orders.map((order) => order.id)
        }
      },
      select: selectOrderDtoDetail,
      orderBy: {
        createdAt: 'desc'
      }
    });
    const guestOfTable = await prisma.guest.findFirstOrThrow({
      where: {
        tableNumber,
        token: token
      }
    });

    const socketRecord = await prisma.socket.findUnique({
      where: {
        guestId: guestOfTable.id
      }
    });

    return {
      orders: ordersResult,
      socketId: socketRecord?.socketId
    };
  };

  /**
   * @description Get order detail
   * @param orderId
   * @returns order detail by orderId
   * @buihuytuyen
   */
  getDetail = (orderId: string) => {
    return prisma.order.findUniqueOrThrow({
      where: {
        id: orderId
      },
      select: selectOrderDtoDetail
    });
  };

  /**
   * @description Update order
   * @param orderId
   * @param body
   * @returns order detail and socketId after updated order by orderId and body
   * @buihuytuyen
   */
  update = async ({ id, ...data }: UpdateOrder) => {
    const { status, dishId, quantity, orderHandlerId, options } = data;
    const result = await prisma.$transaction(async (tx) => {
      const order = await prisma.order.findUniqueOrThrow({
        where: {
          id
        },
        include: {
          dishSnapshot: true
        }
      });
      let dishSnapshotId = order.dishSnapshotId;
      if (order.dishSnapshot.dishId !== dishId) {
        const dish = await tx.dish.findUniqueOrThrow({
          where: {
            id: dishId
          }
        });
        const dishSnapshot = await tx.dishSnapshot.create({
          data: {
            description: dish.description,
            image: dish.image,
            name: dish.name,
            category: dish.category,
            options: dish.options,
            price: dish.price,
            dishId: dish.id,
            status: dish.status
          }
        });
        dishSnapshotId = dishSnapshot.id;
      }
      const newOrder = await tx.order.update({
        where: {
          id
        },
        data: {
          status,
          dishSnapshotId,
          quantity,
          orderHandlerId,
          options
        },
        select: selectOrderDtoDetail
      });
      return newOrder;
    });

    const guestOfTable = await prisma.guest.findFirstOrThrow({
      where: {
        tableNumber: result.tableNumber,
        token: result.token
      }
    });

    const socketRecord = await prisma.socket.findUnique({
      where: {
        guestId: guestOfTable.id
      }
    });
    return {
      order: result,
      socketId: socketRecord?.socketId
    };
  };
}

export default new OrderController();
