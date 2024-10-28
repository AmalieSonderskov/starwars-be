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
const builder_1 = require("../builder");
builder_1.builder.queryType({});
const isAdmin = (user) => {
    return user && user.role == "ADMIN";
};
builder_1.builder.prismaObject("User", {
    description: "A user",
    name: "AuthInputObject",
    fields: (t) => ({
        id: t.exposeInt("id"),
        name: t.exposeString("name"),
        items: t.relation("items"),
        wallet: t.exposeFloat("wallet"),
        role: t.exposeString("role"),
        picture: t.exposeString("picture"),
    }),
});
// Get all users (admin only)
builder_1.builder.queryField("users", (t) => t.prismaField({
    type: ["User"],
    resolve: (_, args, { db }, ctx) => {
        if (!isAdmin(ctx.user))
            throw new Error("Not authorized");
        return builder_1.prisma.user.findMany();
    },
}));
// Get user balance
builder_1.builder.queryField("userWallet", (t) => t.field({
    type: "Float",
    resolve: (_, args, ctx) => __awaiter(void 0, void 0, void 0, function* () {
        if (!ctx.user)
            throw new Error("Not authorized");
        const user = yield builder_1.prisma.user.findUnique({
            where: {
                id: ctx.user.id,
            },
            select: {
                wallet: true,
            },
        });
        return user.wallet;
    }),
}));
//Me query
builder_1.builder.queryField("userLoggedIn", (t) => t.prismaField({
    type: "User",
    resolve: (_1, args_1, _a, ctx_1) => __awaiter(void 0, [_1, args_1, _a, ctx_1], void 0, function* (_, args, { db }, ctx) {
        if (!ctx.user)
            throw new Error("Not authorized");
        const user = yield builder_1.prisma.user.findUnique({
            where: {
                id: ctx.user.id,
            },
            select: {
                wallet: true,
                name: true,
                role: true,
                id: true,
                picture: true,
            },
        });
        return user;
    }),
}));
// Add Credit to wallet
builder_1.builder.mutationField("addCredits", (t) => t.field({
    type: "Float",
    args: {
        creditChange: t.arg.float({ required: true }),
    },
    resolve: (_1, _a, ctx_1) => __awaiter(void 0, [_1, _a, ctx_1], void 0, function* (_, { creditChange }, ctx) {
        if (!ctx.user) {
            throw new Error("Not authorized");
        }
        const userId = ctx.user.id;
        const updatedUser = yield builder_1.prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                wallet: {
                    increment: creditChange,
                },
            },
            select: {
                wallet: true,
            },
        });
        return updatedUser.wallet;
    }),
}));
//Update user picture
builder_1.builder.mutationField("updateProfilePicture", (t) => t.field({
    type: "String",
    args: {
        picture: t.arg.string({ required: true }),
    },
    resolve: (_1, _a, ctx_1) => __awaiter(void 0, [_1, _a, ctx_1], void 0, function* (_, { picture }, ctx) {
        if (!ctx.user) {
            throw new Error("Not authorized");
        }
        const userId = ctx.user.id;
        const updatedUser = yield builder_1.prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                picture,
            },
            select: {
                picture: true,
            },
        });
        return updatedUser.picture;
    }),
}));
//# sourceMappingURL=user.js.map