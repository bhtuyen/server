import prisma from '@/database';
import { selectOrderDtoDetail, type CreateOrders, type UpdateOrder } from '@/schemaValidations/order.schema';
import { DishStatus, OrderStatus, TableStatus } from '@prisma/client';

class OrderController {
  /**
   * @description Create orders for guest
   * @param orderHandlerId
   * @param body
   * @returns orders list and socketId
   * @buihuytuyen
   */
  createOrdersController = async (orderHandlerId: string, body: CreateOrders) => {
    const { guestId, orders } = body;
    const guest = await prisma.guest.findUniqueOrThrow({
      where: {
        id: guestId
      }
    });
    if (guest.tableNumber === null) {
      throw new Error('Bàn gắn liền với khách hàng này đã bị xóa, vui lòng chọn khách hàng khác!');
    }
    const table = await prisma.table.findUniqueOrThrow({
      where: {
        number: guest.tableNumber
      }
    });
    if (table.status === TableStatus.Hidden) {
      throw new Error(`Bàn ${table.number} gắn liền với khách hàng đã bị ẩn, vui lòng chọn khách hàng khác!`);
    }

    const [ordersRecord, socketRecord] = await Promise.all([
      prisma.$transaction(async (tx) => {
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
                guestId,
                quantity: order.quantity,
                tableNumber: guest.tableNumber,
                orderHandlerId,
                status: OrderStatus.Pending,
                options: order.options
              },
              select: selectOrderDtoDetail
            });
            return orderRecord;
          })
        );
        return ordersRecord;
      }),

      prisma.socket.findUnique({
        where: {
          guestId: body.guestId
        }
      })
    ]);
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
  getOrdersController = async ({ fromDate, toDate }: { fromDate?: Date; toDate?: Date }) => {
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
   * @description Pay orders
   * @param guestId
   * @param orderHandlerId
   * @returns orders list and socketId after paid orders for guest by guestId and orderHandlerId
   * @buihuytuyen
   */
  payOrdersController = async ({ guestId, orderHandlerId }: { guestId: string; orderHandlerId: string }) => {
    const orders = await prisma.order.findMany({
      where: {
        guestId,
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
    const [ordersResult, sockerRecord] = await Promise.all([
      prisma.order.findMany({
        where: {
          id: {
            in: orders.map((order) => order.id)
          }
        },
        select: selectOrderDtoDetail,
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.socket.findUnique({
        where: {
          guestId
        }
      })
    ]);
    return {
      orders: ordersResult,
      socketId: sockerRecord?.socketId
    };
  };

  /**
   * @description Get order detail
   * @param orderId
   * @returns order detail by orderId
   * @buihuytuyen
   */
  getOrderDetailController = (orderId: string) => {
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
  updateOrder = async ({ id, ...data }: UpdateOrder) => {
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
    const socketRecord = await prisma.socket.findUnique({
      where: {
        guestId: result.guest.id
      }
    });
    return {
      order: result,
      socketId: socketRecord?.socketId
    };
  };
}

export default new OrderController();
