"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const builder_1 = require("../builder");
const isAdmin = (user) => {
    return user && user.role == "ADMIN";
};
builder_1.builder.prismaObject("Transaction", {
    description: "A transaction associated with a purchase",
    fields: (t) => ({
        id: t.exposeID("id"),
        time: t.exposeString("time"),
        purchase: t.relation("purchase"),
        historicItem: t.exposeString("historicJsonItem"),
    }),
});
builder_1.builder.queryField("userTransactions", (t) => t.prismaField({
    type: ["Transaction"],
    args: {
        userId: t.arg.int({ required: true }),
    },
    resolve: (_, args, { userId }, ctx) => {
        if (!ctx.user)
            throw new Error("Not authorized");
        if (ctx.user.id == userId || isAdmin(ctx.user)) {
            return builder_1.prisma.transaction.findMany({
                where: { purchase: { buyerId: userId } },
            });
        }
        throw new Error("Not authorized");
    },
}));
//# sourceMappingURL=transactions.js.map