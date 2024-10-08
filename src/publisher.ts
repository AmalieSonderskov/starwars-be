import { prisma } from "./builder";
import { pubsub } from "./server";

export async function publishWeight() {
  setInterval(async () => {
    const itemsByType = await getTypedLists();

    const updates = itemsByType.map(async (typeList) => {
      const newWeight = Math.random() * 4 + 1;
      console.log(`Updating ${typeList[0].type} to ${newWeight}`);
      const itemType = typeList[0].type;

      await prisma.item.updateMany({
        where: { type: itemType },
        data: { weight: newWeight },
      });
    });

    const updatedItems = await prisma.item.findMany();
    pubsub.publish("ITEMS_UPDATE", { updatedItems });
  }, 10000);
}

async function getTypedLists() {
  const items = await prisma.item.findMany();
  const uniqueTypes = [...new Set(items.map((item) => item.type))];
  const groupedItems = uniqueTypes.map((type) => {
    return items.filter((item) => item.type === type);
  });
  return groupedItems;
}
