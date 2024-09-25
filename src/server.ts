import { createYoga, YogaInitialContext } from "graphql-yoga";
import { createServer } from "node:http";
import { builder, prisma } from "./builder";
import { verify } from "jsonwebtoken";
import "./schema";

async function auth(req: Request) {
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

const yoga = createYoga({
  schema: builder.toSchema(),
  context: async ({ request }) => ({
    user: await auth(request),
  }),
});

const server = createServer(yoga);

server.listen(42069);
