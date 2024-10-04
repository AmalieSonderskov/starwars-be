import { builder, prisma } from "../builder";
import { itemObject } from "./item";

builder.subscriptionType({});

builder.subscriptionFields((t) => ({
  incrementedCount: t.field({
    type: [itemObject],
    subscribe: (_parent, _args, ctx) => ctx.pubSub.subscribe("ITEMS_UPDATE"),
    resolve: () => prisma.item.findMany(),
  }),
}));

async function getTypedLists() {
  const items = await prisma.item.findMany();
  const uniqueTypes = [...new Set(items.map((item) => item.type))];
  const groupedItems = uniqueTypes.map((type) => {
    return items.filter((item) => item.type === type);
  });
  return groupedItems;
}
