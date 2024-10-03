import { User } from "@prisma/client";
import { builder, prisma } from "../builder";

const isAdmin = (user: User | null) => {
  return user && user.role == "ADMIN";
};

builder.prismaObject("Sale", {
  description: "A sale a user made",
  fields: (t) => ({
    id: t.exposeID("id"),
    time: t.exposeString("time"),
    purchase: t.relation("purchase"),
    historicItems: t.exposeString("historicJsonItems"),
    seller: t.relation("seller"),
  }),
});

builder.queryField("userSales", (t) =>
  t.prismaField({
    type: ["Sale"],
    args: {
      userId: t.arg.int({ required: true }),
    },
    resolve: (_, args, { userId }, ctx) => {
      if (!ctx.user) throw new Error("Not authorized");
      if (ctx.user.id == userId || isAdmin(ctx.user)) {
        return prisma.sale.findMany({
          where: { sellerId: userId },
        });
      }
      throw new Error("Not authorized");
    },
  })
);
