import { User } from "@prisma/client";
import { builder, prisma } from "../builder";

const isAdmin = (user: User | null) => {
  return user && user.role == "ADMIN";
};

builder.prismaObject("Item", {
  description: "An item for sale",
  fields: (t) => ({
    id: t.exposeInt("id", { nullable: false }),
    name: t.exposeString("name"),
    type: t.exposeString("type"),
    price: t.exposeFloat("price"),
    description: t.exposeString("description"),
    user: t.relation("user"),
    forSale: t.exposeBoolean("forSale"),
  }),
});

const itemInputRef = builder.inputType("ItemInput", {
  fields: (t) => ({
    name: t.string({ required: true }),
    type: t.string({ required: true }),
    price: t.float({ required: true }),
    description: t.string({ required: true }),
    userId: t.int({ required: true }),
    forSale: t.boolean({ required: true }),
  }),
});

export const a = builder.mutationType({
  fields: (t) => ({
    //Update item (admin only)
    updateItem: t.prismaField({
      type: "Item",
      args: {
        item: t.arg({ type: itemInputRef, required: true }),
        itemId: t.arg.int({ required: true }),
      },
      resolve: async (q, _, { item, itemId }, ctx) => {
        console.log(ctx);

        return prisma.item.update({
          ...q,
          where: {
            id: itemId,
          },
          data: {
            ...item,
            id: itemId,
          },
        });
      },
    }),
    //Create a new item (admin only)
    createItem: t.prismaField({
      type: "Item",
      args: {
        item: t.arg({ type: itemInputRef, required: true }),
      },
      resolve: async (q, _, args, ctx) => {
        if (!isAdmin(ctx.user)) throw new Error("Not authorized");
        const { item } = args;
        return prisma.item.create({
          ...q,
          data: {
            ...item,
          },
        });
      },
    }),
  }),
});

builder.queryFields((t) => ({
  // Get all items (admin only)
  items: t.prismaField({
    type: ["Item"],
    resolve: (q, _, __, ctx) => {
      if (!isAdmin(ctx.user)) throw new Error("Not authorized");
      return prisma.item.findMany({
        ...q,
      });
    },
  }),

  // Get items by user id
  itemsByUser: t.prismaField({
    type: ["Item"],
    args: {
      userId: t.arg.int({ required: true }),
    },
    resolve: (_, q, { userId }) =>
      prisma.item.findMany({
        where: { userId },
      }),
  }),

  // Get an item by id
  item: t.prismaField({
    type: "Item",
    args: {
      id: t.arg.int({ required: true }),
    },
    resolve: (q, _, { id }) =>
      prisma.item.findUnique({
        ...q,
        where: { id },
      }),
  }),

  //Get all item for sale from other user that are not logged in
  itemsForSale: t.prismaField({
    type: ["Item"],
    resolve: (_, q, __, ctx) =>
      prisma.item.findMany({
        ...q,
        where: { forSale: true, userId: { not: ctx.user?.id } },
      }),
  }),
}));
