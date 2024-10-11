import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

(async function main() {
  const user1 = await prisma.user.create({
    data: {
      name: "Watto",
      wallet: 100000,
      role: "ADMIN",
    },
  });
  const user2 = await prisma.user.create({
    data: {
      name: "Luke",
      wallet: 10000,
      role: "USER",
    },
  });

  await prisma.item.createMany({
    data: [
      {
        name: "Blue crystal",
        type: "Kyber Crystal",
        price: 99000,
        description: "Good quality blue crystal",
        userId: user1.id,
        forSale: true,
      },
      {
        name: "Silver hilt",
        type: "Hilt",
        price: 1000,
        description: "Metal hilt for lightsabers",
        userId: user1.id,
        forSale: true,
      },
      {
        name: "Gold hilt",
        type: "Hilt",
        price: 8000,
        description: "Golden hilt, very rare",
        userId: user1.id,
        forSale: false,
      },
      {
        name: "Green crystal",
        type: "Kyber Crystal",
        price: 4500,
        description: "Good quality green crystal",
        userId: user1.id,
        forSale: true,
      },
    ],
  });

  console.log("Data seeded successfully!");
})();
