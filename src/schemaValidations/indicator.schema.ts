import { buildReply } from '@/schemaValidations/common.schema';
import { dishDtoDetail } from '@/schemaValidations/dish.schema';
import z from 'zod';

export const dishIndicator = dishDtoDetail.extend({ successOrders: z.number() });

export const revenueByDate = z.object({
  date: z.string(),
  revenue: z.number()
});

export const dashboardIndicator = z.object({
  revenue: z.number(),
  guestCount: z.number(),
  orderCount: z.number(),
  servingTableCount: z.number(),
  dishesIndicator: z.array(dishIndicator),
  revenuesByDate: z.array(revenueByDate)
});

export const dashboardIndicatorRes = buildReply(dashboardIndicator);

export type DishIndicator = z.TypeOf<typeof dishIndicator>;

export type DashboardIndicator = z.TypeOf<typeof dashboardIndicator>;

export type DashboardIndicatorRes = z.TypeOf<typeof dashboardIndicatorRes>;

export type RevenueByDate = z.TypeOf<typeof revenueByDate>;
