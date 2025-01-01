import { DishCategory, OrderStatus, PaymentStatus } from '@prisma/client';

import type { Transaction, TransactionWebhook } from '@/schemaValidations/transaction.schema';

import { TransactionType } from '@/constants/enum';
import prisma from '@/database';
import { selectOrderDtoDetail } from '@/schemaValidations/order.schema';

class TransactionController {
  webhook = async (data: TransactionWebhook) => {
    const {
      id,
      gateway,
      transactionDate,
      accountNumber,
      code,
      content,
      transferType,
      transferAmount,
      accumulated,
      subAccount,
      referenceCode,
      description
    } = data;

    const transactionOld = await prisma.transaction.findFirst({
      where: {
        idSePay: id
      }
    });

    if (transactionOld) {
      return true;
    }

    // content: tableNumberBHTtoken
    const tableNumber = content.split('BHT')[0];
    const token = content.split('BHT')[1];

    const table = await prisma.table.findFirst({
      where: {
        number: tableNumber,
        token
      }
    });

    if (!table) {
      return false;
    }

    if (table.paymentStatus === PaymentStatus.Paid) {
      return false;
    }

    const ordersOfTable = await prisma.order.findMany({
      where: {
        token,
        tableNumber: table.number
      },
      select: selectOrderDtoDetail
    });

    if (ordersOfTable.length === 0) {
      return false;
    }

    const totalAmount = ordersOfTable.reduce((acc, { dishSnapshot: { category, price }, quantity }) => {
      if (category === DishCategory.Buffet || price === null) return acc;

      return acc + price.mul(quantity).toNumber();
    }, 0);

    if (totalAmount !== transferAmount) {
      return false;
    }

    const transaction: Transaction = {
      idSePay: id,
      gateway,
      transactionDate: new Date(transactionDate),
      accountNumber,
      code,
      transactionContent: content,
      referenceNumber: referenceCode,
      accumulated,
      subAccount,
      body: description,
      amountIn: transferType === TransactionType.IN ? transferAmount : 0,
      amountOut: transferType === TransactionType.OUT ? transferAmount : 0,
      createdAt: new Date()
    };

    const result = await prisma.$transaction(async (tx) => {
      await Promise.all([
        tx.transaction.create({
          data: transaction
        }),
        await tx.table.update({
          where: {
            number: table.number,
            token
          },
          data: {
            paymentStatus: PaymentStatus.Paid
          }
        }),
        tx.order.updateMany({
          where: {
            token,
            tableNumber: table.number
          },
          data: {
            status: OrderStatus.Paid
          }
        })
      ]);

      return true;
    });

    return result;
  };
}

export default new TransactionController();
