import { User } from "@prisma/client";
import { builder, prisma } from "../builder";

builder.queryType({});

const isAdmin = (user: User | null) => {
  return user && user.role == "ADMIN";
};

builder.prismaObject("User", {
  description: "A user",
  name: "AuthInputObject",
  fields: (t) => ({
    id: t.exposeInt("id"),
    name: t.exposeString("name"),
    items: t.relation("items"),
    wallet: t.exposeFloat("wallet"),
    role: t.exposeString("role"),
  }),
});

// Get all users (admin only)
builder.queryField("users", (t) =>
  t.prismaField({
    type: ["User"],
    resolve: (_, args, { db }, ctx) => {
      if (!isAdmin(ctx.user)) throw new Error("Not authorized");
      return prisma.user.findMany();
    },
  })
);

// Get user balance
builder.queryField("userWallet", (t) =>
  t.field({
    type: "Float",
    resolve: async (_, args, ctx) => {
      if (!ctx.user) throw new Error("Not authorized");

      const user = await prisma.user.findUnique({
        where: {
          id: ctx.user!.id,
        },
        select: {
          wallet: true,
        },
      });

      return user!.wallet;
    },
  })
);

//Me query
builder.queryField("userLoggedIn", (t) =>
  t.prismaField({
    type: "User",
    resolve: async (_, args, { db }, ctx) => {
      if (!ctx.user) throw new Error("Not authorized");

      const user = await prisma.user.findUnique({
        where: {
          id: ctx.user!.id,
        },
        select: {
          wallet: true,
          name: true,
          role: true,
          id: true,
        },
      });

      return user;
    },
  })
);

// Add Credit to wallet
builder.mutationField("addCredits", (t) =>
  t.field({
    type: "Float",
    args: {
      creditChange: t.arg.float({ required: true }),
    },
    resolve: async (_, { creditChange }, ctx) => {
      if (!ctx.user) {
        throw new Error("Not authorized");
      }

      const userId = ctx.user.id;

      const updatedUser = await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          wallet: {
            increment: creditChange,
          },
        },
        select: {
          wallet: true,
        },
      });
      return updatedUser.wallet;
    },
  })
);
