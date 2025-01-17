import { Prisma } from '@prisma/client';
import z from 'zod';

export const transaction = z.object({
  id: z.string().uuid().optional(),
  token: z.string(),
  idSePay: z.number(),
  gateway: z.string(),
  transactionDate: z.date(),
  accountNumber: z.string().nullable(),
  subAccount: z.string().nullable(),
  amountIn: z.instanceof(Prisma.Decimal).or(z.number()),
  amountOut: z.instanceof(Prisma.Decimal).or(z.number()),
  accumulated: z.instanceof(Prisma.Decimal).or(z.number()),
  code: z.string().nullable(),
  transactionContent: z.string().nullable(),
  referenceNumber: z.string().nullable(),
  body: z.string().nullable(),
  createdAt: z.date().default(new Date())
});

export type Transaction = z.TypeOf<typeof transaction>;

export const transactionWebhook = z.object({
  id: z.number(), // ID giao dịch trên SePay
  gateway: z.string(), // Brand name của ngân hàng
  transactionDate: z.string(), // Thời gian xảy ra giao dịch phía ngân hàng
  accountNumber: z.string().nullable(), // Số tài khoản ngân hàng
  code: z.string().nullable(), // Mã code thanh toán (sepay tự nhận diện dựa vào cấu hình tại Công ty -> Cấu hình chung)
  content: z.string(), // Nội dung chuyển khoản
  transferType: z.string(), // Loại giao dịch. in là tiền vào, out là tiền ra
  transferAmount: z.number(), // Số tiền giao dịch
  accumulated: z.number(), // Số dư tài khoản (lũy kế)
  subAccount: z.string().nullable(), // Tài khoản ngân hàng phụ (tài khoản định danh)
  referenceCode: z.string(), // Mã tham chiếu
  description: z.string()
});

export type TransactionWebhook = z.TypeOf<typeof transactionWebhook>;

export const transactionWebhookRes = z.object({
  message: z.string(),
  success: z.boolean()
});

export type TransactionWebhookRes = z.TypeOf<typeof transactionWebhookRes>;
