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
const item_1 = require("./item");
builder_1.builder.subscriptionType({});
builder_1.builder.subscriptionFields((t) => ({
    itemsForSale: t.field({
        type: [item_1.itemObject],
        subscribe: (_parent, _args, ctx) => {
            setTimeout(() => {
                ctx.pubSub.publish("ITEMS_UPDATE");
            }, 100);
            return ctx.pubSub.subscribe("ITEMS_UPDATE");
        },
        resolve: (_parent, _args, ctx) => __awaiter(void 0, void 0, void 0, function* () {
            const items = yield builder_1.prisma.item.findMany({
                where: {
                    forSale: true,
                },
            });
            const postItems = items.map(item => {
                return Object.assign(Object.assign({}, item), { price: Math.floor(item.price * item.weight) });
            });
            return postItems;
        })
    })
}));
//# sourceMappingURL=subscriptions.js.map