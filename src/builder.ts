import { PrismaClient, User } from "@prisma/client";
import SchemaBuilder from "@pothos/core";

import PothosPrismaPlugin from "@pothos/plugin-prisma";
import PrismaTypes from "./pothos-types";

export const prisma = new PrismaClient();

export const builder = new SchemaBuilder<{
  PrismaTypes: PrismaTypes;
  Context: { user: User | null };
}>({
  plugins: [PothosPrismaPlugin],
  prisma: {
    client: prisma,

    // use where clause from prismaRelatedConnection for totalCount (defaults to true)
    filterConnectionTotalCount: true,
    // warn when not using a query parameter correctly
    onUnusedQuery: process.env.NODE_ENV === "production" ? null : "warn",
  },
});
