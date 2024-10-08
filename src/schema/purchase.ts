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
    sales: t.relation("sales"),
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
      console.log(ctx);
      console.log({ userId, ctx });

      if (!ctx.user) throw new Error("Not authorized");
      if (ctx.user.id != userId) throw new Error("Userid doesn't match");
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

      const totalAmount = Math.floor(items.reduce((total, item) => {
        return total + item.price*item.weight;
      }, 0))

      if (ctx.user.wallet < totalAmount) {
        throw new Error("Insufficient Funds");
      }

      const finalPurchase = await prisma.$transaction(async (prisma) => {
        const currentTime = new Date().toString();
        const createFinalPurchase = prisma.purchase.create({
          data: {
            time: currentTime,
            buyerId: args.buyerId,
            transactions: {
              create: args.itemInputs.map((itemId) => ({
                time: currentTime,
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

        const addSellerEarningsUpdatwOwnershipCreateSale = async () => {
          for (const item of items) {
            await prisma.user.update({
              where: { id: item.userId },
              data: {
                wallet: {
                  increment: Math.floor(item.price*item.weight),
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
            await prisma.sale.create({
              data: {
                time: currentTime,
                sellerId: item.userId,
                purchaseId: (await createFinalPurchase).id,
                historicJsonItems: JSON.stringify(item),
              },
            });
          }
        };

        const updatedUsers = await addSellerEarningsUpdatwOwnershipCreateSale();

        await Promise.all([createFinalPurchase, buyerPayment, updatedUsers]);

        return createFinalPurchase;
      });

      return finalPurchase;
    },
  })
);
