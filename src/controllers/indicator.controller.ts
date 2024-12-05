import envConfig from '@/config';
import prisma from '@/database';
import type { DashboardIndicator, DishIndicator, RevenueByDate } from '@/schemaValidations/indicator.schema';
import { OrderStatus } from '@prisma/client';
import { formatInTimeZone } from 'date-fns-tz';

export const dashboardIndicatorController = async ({
  fromDate,
  toDate
}: {
  fromDate: Date;
  toDate: Date;
}): Promise<DashboardIndicator> => {
  const [orders, guests, dishes] = await Promise.all([
    prisma.order.findMany({
      include: {
        dishSnapshot: true,
        table: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      where: {
        createdAt: {
          gte: fromDate,
          lte: toDate
        }
      }
    }),
    prisma.guest.findMany({
      where: {
        createdAt: {
          gte: fromDate,
          lte: toDate
        },
        orders: {
          some: {
            status: OrderStatus.Paid
          }
        }
      }
    }),
    prisma.dish.findMany()
  ]);

  // Doanh thu
  let revenue = 0;
  // Số lượng khách gọi món thành công
  const guestCount = guests.length;
  // Số lượng đơn
  const orderCount = orders.length;
  // Thống kê món ăn
  const dishesIndicatorObj: Record<string, DishIndicator> = dishes.reduce((acc, dish) => {
    acc[dish.id] = { ...dish, successOrders: 0 };
    return acc;
  }, {} as any);
  // Doanh thu theo ngày
  // Tạo object revenueByDateObj với key là ngày từ fromDate -> toDate và value là doanh thu
  const revenuesByDateObj: { [key: string]: number } = {};

  // Lặp từ fromDate -> toDate
  for (let i = fromDate; i <= toDate; i.setDate(i.getDate() + 1)) {
    revenuesByDateObj[formatInTimeZone(i, envConfig.SERVER_TIMEZONE, 'dd/MM/yyyy')] = 0;
  }

  // Số lượng bàn đang được sử dụng
  const tableNumberObj: { [key: string]: boolean } = {};
  orders.forEach((order) => {
    if (order.status === OrderStatus.Paid) {
      revenue += Number(order.dishSnapshot.price) * order.quantity;
      if (order.dishSnapshot.dishId && dishesIndicatorObj[order.dishSnapshot.dishId]) {
        dishesIndicatorObj[order.dishSnapshot.dishId].successOrders++;
      }
      const date = formatInTimeZone(order.createdAt, envConfig.SERVER_TIMEZONE, 'dd/MM/yyyy');
      revenuesByDateObj[date] = (revenuesByDateObj[date] ?? 0) + Number(order.dishSnapshot.price) * order.quantity;
    }
    if (
      [OrderStatus.Processing, OrderStatus.Pending, OrderStatus.Delivered].includes(order.status as any) &&
      order.tableNumber !== null
    ) {
      tableNumberObj[order.tableNumber] = true;
    }
  });
  // Số lượng bàn đang sử dụng
  const servingTableCount = Object.keys(tableNumberObj).length;

  // Doanh thu theo ngày
  const revenuesByDate = Object.keys(revenuesByDateObj).map<RevenueByDate>((date) => {
    return {
      date,
      revenue: revenuesByDateObj[date]
    };
  });
  const dishesIndicator = Object.values(dishesIndicatorObj);
  return {
    revenue,
    guestCount,
    orderCount,
    servingTableCount,
    dishesIndicator,
    revenuesByDate
  };
};
