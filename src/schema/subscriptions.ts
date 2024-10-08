import { builder, prisma } from "../builder";
import { itemObject } from "./item";

builder.subscriptionType({});

builder.subscriptionFields((t) => ({
  itemsForSale: t.field({
    type: [itemObject],
    subscribe: (_parent, _args, ctx) => {
      setTimeout(() => {
        ctx.pubSub.publish("ITEMS_UPDATE");
      }, 100);

      return ctx.pubSub.subscribe("ITEMS_UPDATE");
    },
    resolve: (_parent, _args, ctx) =>
      prisma.item.findMany({
        where: {
          forSale: true,
        },
      }),
  }),
}));
