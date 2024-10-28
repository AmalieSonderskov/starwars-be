"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const builder_1 = require("../builder");
const isAdmin = (user) => {
    return user && user.role == "ADMIN";
};
builder_1.builder.prismaObject("Sale", {
    description: "A sale a user made",
    fields: (t) => ({
        id: t.exposeID("id"),
        time: t.exposeString("time"),
        purchase: t.relation("purchase"),
        historicItems: t.exposeString("historicJsonItems"),
        seller: t.relation("seller"),
    }),
});
builder_1.builder.queryField("userSales", (t) => t.prismaField({
    type: ["Sale"],
    args: {
        userId: t.arg.int({ required: true }),
    },
    resolve: (_, args, { userId }, ctx) => {
        if (!ctx.user)
            throw new Error("Not authorized");
        if (ctx.user.id == userId || isAdmin(ctx.user)) {
            return builder_1.prisma.sale.findMany({
                where: { sellerId: userId },
            });
        }
        throw new Error("Not authorized");
    },
}));
//# sourceMappingURL=sales.js.map