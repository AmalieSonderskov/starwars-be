"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pubsub = void 0;
const graphql_yoga_1 = require("graphql-yoga");
const node_http_1 = require("node:http");
const builder_1 = require("./src/builder");
const jsonwebtoken_1 = require("jsonwebtoken");
require("./src/schema");
const ws_1 = require("ws");
const ws_2 = require("graphql-ws/lib/use/ws");
const publisher_1 = require("./src/publisher");
function auth(req) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        if (!req || !req.headers) {
            return null;
        }
        const token = (_a = req.headers.get("Authorization")) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
        if (!token || token === "null") {
            return null;
        }
        try {
            const parsed_token = (0, jsonwebtoken_1.verify)(token, "secret");
            switch (typeof parsed_token) {
                case "string":
                    return null;
                case "object":
                    const a = yield builder_1.prisma.user.findUnique({
                        where: { id: Number(parsed_token.sub) },
                    });
                    return a;
                default:
                    return null;
            }
        }
        catch (e) {
            console.log(e);
            return null;
        }
    });
}
exports.pubsub = (0, graphql_yoga_1.createPubSub)();
const yoga = (0, graphql_yoga_1.createYoga)({
    schema: builder_1.builder.toSchema(),
    context: (_a) => __awaiter(void 0, [_a], void 0, function* ({ request }) {
        return ({
            pubSub: exports.pubsub,
            user: yield auth(request),
        });
    }),
    graphiql: {
        subscriptionsProtocol: "WS",
    },
});
const server = (0, node_http_1.createServer)(yoga);
const wsServer = new ws_1.WebSocketServer({
    server: server,
    path: yoga.graphqlEndpoint,
});
(0, ws_2.useServer)({
    execute: (args) => args.rootValue.execute(args),
    subscribe: (args) => args.rootValue.subscribe(args),
    onSubscribe: (ctx, msg) => __awaiter(void 0, void 0, void 0, function* () {
        const { schema, execute, subscribe, contextFactory, parse, validate } = yoga.getEnveloped(Object.assign(Object.assign({}, ctx), { req: ctx.extra.request, socket: ctx.extra.socket, params: msg.payload }));
        const args = {
            schema,
            operationName: msg.payload.operationName,
            document: parse(msg.payload.query),
            variableValues: msg.payload.variables,
            contextValue: yield contextFactory(),
            rootValue: {
                execute,
                subscribe,
            },
        };
        const errors = validate(args.schema, args.document);
        if (errors.length)
            return errors;
        return args;
    }),
}, wsServer);
server.listen(process.env.PORT || 42069);
(0, publisher_1.publishWeight)();
//# sourceMappingURL=server.js.map