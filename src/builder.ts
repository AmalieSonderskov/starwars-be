import { PrismaClient, User } from "@prisma/client";
import SchemaBuilder from "@pothos/core";
import PothosPrismaPlugin from "@pothos/plugin-prisma";
import PrismaTypes from "./pothos-types";
import { PubSub } from "../server";
import { createClient } from "@libsql/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";

const libsql = createClient({
  url: `${process.env.DATABASE_URL}`,
  authToken: `${process.env.DATABASE_AUTH_TOKEN}`,
})

const adapter = new PrismaLibSQL(libsql)

export const prisma = new PrismaClient({ adapter })

export const builder = new SchemaBuilder<{
  PrismaTypes: PrismaTypes;
  Context: {
    user: User | null;
    pubSub: PubSub;
  };
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
