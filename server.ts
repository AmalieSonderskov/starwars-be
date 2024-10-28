import { createPubSub, createYoga } from "graphql-yoga";
import { createServer } from "node:http";
import { builder, prisma } from "./src/builder";
import { verify } from "jsonwebtoken";
import "./src/schema";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";
import { publishWeight } from "./src/publisher";

async function auth(req: Request) {
  if (!req || !req.headers) {
    return null;
  }
  const token = req.headers.get("Authorization")?.split(" ")[1];
  if (!token || token === "null") {
    return null;
  }

  try {
    const parsed_token = verify(token, "secret");
    switch (typeof parsed_token) {
      case "string":
        return null;
      case "object":
        const a = await prisma.user.findUnique({
          where: { id: Number(parsed_token.sub) },
        });
        return a;
      default:
        return null;
    }
  } catch (e) {
    console.log(e);
    return null;
  }
}

export const pubsub = createPubSub();
export type PubSub = typeof pubsub;

const yoga = createYoga({
  schema: builder.toSchema(),
  context: async ({ request }) => ({
    pubSub: pubsub,
    user: await auth(request),
  }),
  graphiql: {
    subscriptionsProtocol: "WS",
  },
});

const server = createServer(yoga);

const wsServer = new WebSocketServer({
  server: server,
  path: yoga.graphqlEndpoint,
});

useServer(
  {
    execute: (args: any) => args.rootValue.execute(args),
    subscribe: (args: any) => args.rootValue.subscribe(args),
    onSubscribe: async (ctx, msg) => {
      const { schema, execute, subscribe, contextFactory, parse, validate } =
        yoga.getEnveloped({
          ...ctx,
          req: ctx.extra.request,
          socket: ctx.extra.socket,
          params: msg.payload,
        });
      const args = {
        schema,
        operationName: msg.payload.operationName,
        document: parse(msg.payload.query),
        variableValues: msg.payload.variables,
        contextValue: await contextFactory(),
        rootValue: {
          execute,
          subscribe,
        },
      };
      const errors = validate(args.schema, args.document);
      if (errors.length) return errors;
      return args;
    },
  },
  wsServer
);

server.listen(process.env.PORT || 42069);
publishWeight();
