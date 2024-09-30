import { intArg } from "nexus";
import { builder, prisma } from "../builder";
import { User } from "@prisma/client";

const isAdmin = (user: User | null) => {
  return user && user.role == "ADMIN";
};

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
    historicItem: t.exposeString("historicJsonItem"),
  }),
});

// Get all purchases (admin only)
builder.queryField("purchases", (t) =>
  t.prismaField({
    type: ["Purchase"],
    resolve: (_, args, { db }, ctx) => {
      if (!isAdmin(ctx.user)) throw new Error("Not authorized");
      return prisma.purchase.findMany({});
    },
  })
);

// Get all purchases on user (user only)
builder.queryField("userPurchase", (t) =>
  t.prismaField({
    type: ["Purchase"],
    args: {
      userId: t.arg.int({ required: true }),
    },
    resolve: (_, args, { userId }, ctx) => {
      if (!ctx.user || ctx.user.id != userId) throw new Error("Not authorized");
      return prisma.purchase.findMany({
        where: { buyerId: userId },
      });
    },
  })
);

// Create a Purchase
builder.mutationField("createPurchase", (t) =>
  t.prismaField({
    type: "Purchase",
    args: {
      buyerId: t.arg.int({ required: true }),
      itemInputs: t.arg.intList({ required: true }),
    },
    resolve: async (q, _, args, ctx) => {
      if (!ctx.user || ctx.user?.id != args.buyerId) {
        throw new Error("Incorrect User");
      }

      const items = await prisma.item.findMany({
        where: {
          id: {
            in: args.itemInputs,
          },
        },
      });

      const totalAmount = items.reduce((total, item) => {
        return total + item.price;
      }, 0);

      if (ctx.user.wallet < totalAmount) {
        throw new Error("Insufficient Funds");
      }

      const finalPurchase = await prisma.$transaction(async (prisma) => {
        const createFinalPurchase = prisma.purchase.create({
          data: {
            time: new Date().toString(),
            buyerId: args.buyerId,
            transactions: {
              create: args.itemInputs.map((itemId) => ({
                time: new Date().toString(),
                historicJsonItem: JSON.stringify(
                  items.find((item) => item.id == itemId)
                ),
              })),
            },
          },
          ...q,
        });
        const buyerPayment = await prisma.user.update({
          where: {
            id: args.buyerId,
          },
          data: {
            wallet: {
              decrement: totalAmount,
            },
          },
        });

        const addSellerEarningsAndUpdatwOwnership = async () => {
          for (const item of items) {
            await prisma.user.update({
              where: { id: item.userId },
              data: {
                wallet: {
                  increment: item.price,
                },
              },
            });
            await prisma.item.update({
              where: { id: item.id },
              data: {
                userId: {
                  set: args.buyerId,
                },
              },
            });
          }
        };

        const updatedUsers = await addSellerEarningsAndUpdatwOwnership();

        await Promise.all([createFinalPurchase, buyerPayment, updatedUsers]);

        return createFinalPurchase;
      });

      return finalPurchase;
    },
  })
);
