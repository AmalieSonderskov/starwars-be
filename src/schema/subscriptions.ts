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
    resolve: async (_parent, _args, ctx) =>{
      const items = await prisma.item.findMany({
        where: {
          forSale: true,
        },
      });
      const postItems = items.map(item => {
        return {
            ...item,
            price: Math.floor(item.price * item.weight)
        };
    })
  return postItems
}})}))
