import { arg } from "nexus";
import { builder, prisma } from "../builder";

builder.prismaObject("Purchase", {
  description: "A record of a purchase",
  fields: (t) => ({
    id: t.exposeID("id"),
    time: t.exposeString("time"),
    buyerId: t.exposeInt("buyerId"),
    transactions: t.relation("transactions"),
  }),
});

builder.prismaObject("Transaction", {
  description: "A transaction associated with a purchase",
  fields: (t) => ({
    id: t.exposeID("id"),
    time: t.exposeString("time"),
    purchase: t.relation("purchase"),
    item: t.relation("item"),
  }),
});

const purchaseInputRef = builder.inputType("PurchaseInput", {
  fields: (t) => ({
    buyerId: t.int({ required: true }),
  }),
});

const transactionInputRef = builder.inputType("TransactionInput", {
  fields: (t) => ({
    itemId: t.int({ required: true }),
  }),
});

// Create a Purchase
builder.mutationField("createPurchase", (t) =>
  t.prismaField({
    type: "Purchase",
    args: {
      purchase: t.arg({ type: purchaseInputRef, required: true }),
      transactions: t.arg({ type: [transactionInputRef], required: true }),
    },
    resolve: async (q, _, args, ctx) => {
      if (!ctx.user || ctx.user?.id != args.purchase.buyerId) {
        throw new Error("Incorrect User");
      }

      const totalAmountPromises = args.transactions.map(async (transaction) => {
        const aggregationResult = await prisma.item.aggregate({
          where: {
            id: transaction.itemId,
          },
          _sum: {
            price: true,
          },
        });
        return aggregationResult._sum.price || 0;
      });

      const totalAmounts = await Promise.all(totalAmountPromises);
      const totalAmount = totalAmounts.reduce((sum, amount) => sum + amount, 0);

      if (ctx.user.wallet < totalAmount) {
        throw new Error("Insufficient Funds");
      }

      const finalPurchase = await prisma.purchase.create({
        data: {
          time: new Date().toJSON(),
          buyerId: args.purchase.buyerId,
          transactions: {
            create: args.transactions.map((transaction) => ({
              time: new Date().toJSON(),
              itemId: transaction.itemId,
            })),
          },
        },
        ...q,
      });

      await prisma.user.update({
        where: {
          id: args.purchase.buyerId,
        },
        data: {
          wallet: {
            decrement: totalAmount,
          },
        },
      });

      let itemIds: number[] = args.transactions.map(
        (element) => element.itemId
      );
      const items = await prisma.item.findMany({
        where: {
          id: {
            in: itemIds,
          },
        },
      });

      for (const item of items) {
        await prisma.user.update({
          where: { id: item.userId },
          data: {
            wallet: {
              increment: item.price,
            },
          },
        });
      }

      for (const item of items) {
        await prisma.item.update({
          where: { id: item.id },
          data: {
            userId: {
              set: args.purchase.buyerId,
            },
          },
        });
      }

      return finalPurchase;
    },
  })
);
