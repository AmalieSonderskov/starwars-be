import { User } from "@prisma/client";
import { builder, prisma } from "../builder";

const isAdmin = (user: User | null) => {
  return user && user.role == "ADMIN";
};

builder.queryField("userTransactions", (t) =>
  t.prismaField({
    type: ["Transaction"],
    args: {
      userId: t.arg.int({ required: true }),
    },
    resolve: (_, args, { userId }, ctx) => {
      if (!ctx.user) throw new Error("Not authorized");
      if (ctx.user.id == userId || isAdmin(ctx.user)) {
        return prisma.transaction.findMany({
          where: { purchase: { buyerId: userId } },
        });
      }
      throw new Error("Not authorized");
    },
  })
);
