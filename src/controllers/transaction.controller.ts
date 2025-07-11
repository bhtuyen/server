import { DishCategory, OrderStatus, PaymentStatus } from '@prisma/client';

import type { Transaction, TransactionWebhook } from '@/schemaValidations/transaction.schema';

import { TransactionType } from '@/constants/enum';
import { prismaOptions } from '@/constants/prisma';
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

    // content: SEVQRtableNumberBHTtoken

    // TAB01

    const tableNumber = code?.split('TAB')[1];

    const transactionOld = await prisma.transaction.findFirst({
      where: {
        idSePay: id
      }
    });

    if (transactionOld) {
      return {
        success: true,
        tableNumber
      };
    }

    const table = await prisma.table.findFirst({
      where: {
        number: tableNumber
      }
    });

    if (!table) {
      return {
        success: false,
        tableNumber
      };
    }

    if (table.paymentStatus === PaymentStatus.Paid) {
      return {
        success: false,
        tableNumber
      };
    }

    const ordersOfTable = await prisma.order.findMany({
      where: {
        token: table.token,
        tableNumber: table.number,
        status: OrderStatus.Delivered
      },
      select: selectOrderDtoDetail
    });

    if (ordersOfTable.length === 0) {
      return {
        success: false,
        tableNumber
      };
    }

    const totalAmount = ordersOfTable.reduce((acc, { dishSnapshot: { category, price }, quantity }) => {
      if (category === DishCategory.Buffet || price === null) return acc;

      return acc + price.mul(quantity).toNumber();
    }, 0);

    if (totalAmount !== transferAmount) {
      return {
        success: false,
        tableNumber
      };
    }

    const transaction: Transaction = {
      idSePay: id,
      token: table.token,
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
        tx.table.update({
          where: {
            number: table.number,
            token: table.token
          },
          data: {
            paymentStatus: PaymentStatus.Paid
          }
        }),
        tx.order.updateMany({
          where: {
            token: table.token,
            tableNumber: table.number,
            id: {
              in: ordersOfTable.map(({ id }) => id)
            }
          },
          data: {
            status: OrderStatus.Paid
          }
        }),
        tx.order.updateMany({
          where: {
            token: table.token,
            tableNumber: table.number,
            id: {
              notIn: ordersOfTable.map(({ id }) => id)
            }
          },
          data: {
            status: OrderStatus.Rejected
          }
        })
      ]);

      return true;
    }, prismaOptions);

    return {
      success: result,
      tableNumber
    };
  };
}

export default new TransactionController();
