import { dish } from '@/schemaValidations/dish.schema';
import z from 'zod';

export const dashboardIndicatorQuerySchema = z.object({
  fromDate: z.coerce.date(),
  toDate: z.coerce.date()
});

export const dishIndicatorSchema = dish.extend({ successOrders: z.number() });

export const revenueByDateSchema = z.object({
  date: z.string(),
  revenue: z.number()
});

export const dashboardIndicatorSchema = z.object({
  revenue: z.number(),
  guestCount: z.number(),
  orderCount: z.number(),
  servingTableCount: z.number(),
  dishesIndicator: z.array(dishIndicatorSchema),
  revenuesByDate: z.array(revenueByDateSchema)
});

export const dashboardIndicatorResSchema = z.object({
  data: dashboardIndicatorSchema,
  message: z.string()
});

export type DishIndicator = z.TypeOf<typeof dishIndicatorSchema>;

export type DashboardIndicator = z.TypeOf<typeof dashboardIndicatorSchema>;

export type DashboardIndicatorRes = z.TypeOf<typeof dashboardIndicatorResSchema>;

export type DashboardIndicatorQuery = z.TypeOf<typeof dashboardIndicatorQuerySchema>;

export type RevenueByDate = z.TypeOf<typeof revenueByDateSchema>;
