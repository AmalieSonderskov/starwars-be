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
const isAdmin = (user) => {
    return user && user.role == "ADMIN";
};
builder_1.builder.prismaObject("Purchase", {
    description: "A record of a purchase",
    fields: (t) => ({
        id: t.exposeID("id"),
        time: t.exposeString("time"),
        buyerId: t.exposeInt("buyerId"),
        transactions: t.relation("transactions"),
        sales: t.relation("sales"),
    }),
});
// Get all purchases (admin only)
builder_1.builder.queryField("purchases", (t) => t.prismaField({
    type: ["Purchase"],
    resolve: (_, args, { db }, ctx) => {
        if (!isAdmin(ctx.user))
            throw new Error("Not authorized");
        return builder_1.prisma.purchase.findMany({});
    },
}));
// Get all purchases on user (user only)
builder_1.builder.queryField("userPurchase", (t) => t.prismaField({
    type: ["Purchase"],
    args: {
        userId: t.arg.int({ required: true }),
    },
    resolve: (_, args, { userId }, ctx) => {
        console.log(ctx);
        console.log({ userId, ctx });
        if (!ctx.user)
            throw new Error("Not authorized");
        if (ctx.user.id != userId)
            throw new Error("Userid doesn't match");
        return builder_1.prisma.purchase.findMany({
            where: { buyerId: userId },
        });
    },
}));
// Create a Purchase
builder_1.builder.mutationField("createPurchase", (t) => t.prismaField({
    type: "Purchase",
    args: {
        buyerId: t.arg.int({ required: true }),
        itemInputs: t.arg.intList({ required: true }),
    },
    resolve: (q, _, args, ctx) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        if (!ctx.user || ((_a = ctx.user) === null || _a === void 0 ? void 0 : _a.id) != args.buyerId) {
            throw new Error("Incorrect User");
        }
        const items = yield builder_1.prisma.item.findMany({
            where: {
                id: {
                    in: args.itemInputs,
                },
            },
        });
        const totalAmount = Math.floor(items.reduce((total, item) => {
            return total + item.price * item.weight;
        }, 0));
        if (ctx.user.wallet < totalAmount) {
            throw new Error("Insufficient Funds");
        }
        const finalPurchase = yield builder_1.prisma.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
            const currentTime = new Date().toString();
            const createFinalPurchase = prisma.purchase.create(Object.assign({ data: {
                    time: currentTime,
                    buyerId: args.buyerId,
                    transactions: {
                        create: args.itemInputs.map((itemId) => ({
                            time: currentTime,
                            historicJsonItem: JSON.stringify(items.find((item) => item.id == itemId)),
                        })),
                    },
                } }, q));
            const buyerPayment = yield prisma.user.update({
                where: {
                    id: args.buyerId,
                },
                data: {
                    wallet: {
                        decrement: totalAmount,
                    },
                },
            });
            const addSellerEarningsUpdatwOwnershipCreateSale = () => __awaiter(void 0, void 0, void 0, function* () {
                for (const item of items) {
                    yield prisma.user.update({
                        where: { id: item.userId },
                        data: {
                            wallet: {
                                increment: Math.floor(item.price * item.weight),
                            },
                        },
                    });
                    yield prisma.item.update({
                        where: { id: item.id },
                        data: {
                            userId: {
                                set: args.buyerId,
                            },
                        },
                    });
                    yield prisma.sale.create({
                        data: {
                            time: currentTime,
                            sellerId: item.userId,
                            purchaseId: (yield createFinalPurchase).id,
                            historicJsonItems: JSON.stringify(item),
                        },
                    });
                }
            });
            const updatedUsers = yield addSellerEarningsUpdatwOwnershipCreateSale();
            yield Promise.all([createFinalPurchase, buyerPayment, updatedUsers]);
            return createFinalPurchase;
        }));
        return finalPurchase;
    }),
}));
//# sourceMappingURL=purchase.js.map