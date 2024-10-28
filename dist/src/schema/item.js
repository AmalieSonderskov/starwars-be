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
exports.a = exports.itemObject = void 0;
const builder_1 = require("../builder");
const isAdmin = (user) => {
    return user && user.role == "ADMIN";
};
exports.itemObject = builder_1.builder.prismaObject("Item", {
    description: "An item for sale",
    fields: (t) => ({
        id: t.exposeInt("id", { nullable: false }),
        name: t.exposeString("name"),
        type: t.exposeString("type"),
        price: t.exposeFloat("price"),
        description: t.exposeString("description"),
        user: t.relation("user"),
        forSale: t.exposeBoolean("forSale"),
        weight: t.exposeFloat("weight"),
    }),
});
const itemInputRef = builder_1.builder.inputType("ItemInput", {
    fields: (t) => ({
        name: t.string({ required: true }),
        type: t.string({ required: true }),
        price: t.float({ required: true }),
        description: t.string({ required: true }),
        userId: t.int({ required: true }),
        forSale: t.boolean({ required: true }),
    }),
});
exports.a = builder_1.builder.mutationType({
    fields: (t) => ({
        //Update item (admin only)
        updateItem: t.prismaField({
            type: "Item",
            args: {
                item: t.arg({ type: itemInputRef, required: true }),
                itemId: t.arg.int({ required: true }),
            },
            resolve: (q_1, _1, _a, ctx_1) => __awaiter(void 0, [q_1, _1, _a, ctx_1], void 0, function* (q, _, { item, itemId }, ctx) {
                console.log(ctx);
                const itemOutput = yield builder_1.prisma.item.update(Object.assign(Object.assign({}, q), { where: {
                        id: itemId,
                    }, data: Object.assign(Object.assign({}, item), { id: itemId }) }));
                ctx.pubSub.publish("ITEMS_UPDATE");
                return itemOutput;
            }),
        }),
        //Create a new item (admin only)
        createItem: t.prismaField({
            type: "Item",
            args: {
                item: t.arg({ type: itemInputRef, required: true }),
            },
            resolve: (q, _, args, ctx) => __awaiter(void 0, void 0, void 0, function* () {
                if (!isAdmin(ctx.user))
                    throw new Error("Not authorized");
                const { item } = args;
                const itemOutput = yield builder_1.prisma.item.create(Object.assign(Object.assign({}, q), { data: Object.assign({}, item) }));
                ctx.pubSub.publish("ITEMS_UPDATE");
                return itemOutput;
            }),
        }),
    }),
});
builder_1.builder.queryFields((t) => ({
    // Get all items (admin only)
    items: t.prismaField({
        type: ["Item"],
        resolve: (q, _, __, ctx) => {
            if (!isAdmin(ctx.user))
                throw new Error("Not authorized");
            return builder_1.prisma.item.findMany(Object.assign({}, q));
        },
    }),
    // Get items by user id
    itemsByUser: t.prismaField({
        type: ["Item"],
        args: {
            userId: t.arg.int({ required: true }),
        },
        resolve: (_, q, { userId }) => builder_1.prisma.item.findMany({
            where: { userId },
        }),
    }),
    // Get an item by id
    item: t.prismaField({
        type: "Item",
        args: {
            id: t.arg.int({ required: true }),
        },
        resolve: (q, _, { id }) => builder_1.prisma.item.findUnique(Object.assign(Object.assign({}, q), { where: { id } })),
    }),
    //Get all item for sale from other user that are not logged in
    itemsForSale: t.prismaField({
        type: ["Item"],
        resolve: (_, q, __, ctx) => {
            var _a;
            return builder_1.prisma.item.findMany(Object.assign(Object.assign({}, q), { where: { forSale: true, userId: { not: (_a = ctx.user) === null || _a === void 0 ? void 0 : _a.id } } }));
        },
    }),
}));
//# sourceMappingURL=item.js.map