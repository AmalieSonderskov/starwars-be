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
exports.publishWeight = publishWeight;
const builder_1 = require("./builder");
const server_1 = require("../server");
function publishWeight() {
    return __awaiter(this, void 0, void 0, function* () {
        setInterval(() => __awaiter(this, void 0, void 0, function* () {
            const itemsByType = yield getTypedLists();
            const updates = itemsByType.map((typeList) => __awaiter(this, void 0, void 0, function* () {
                const newWeight = Math.random() * 4 + 1;
                console.log(`Updating ${typeList[0].type} to ${newWeight}`);
                const itemType = typeList[0].type;
                yield builder_1.prisma.item.updateMany({
                    where: { type: itemType },
                    data: { weight: newWeight },
                });
            }));
            server_1.pubsub.publish("ITEMS_UPDATE");
        }), 10000);
    });
}
function getTypedLists() {
    return __awaiter(this, void 0, void 0, function* () {
        const items = yield builder_1.prisma.item.findMany();
        const uniqueTypes = [...new Set(items.map((item) => item.type))];
        const groupedItems = uniqueTypes.map((type) => {
            return items.filter((item) => item.type === type);
        });
        return groupedItems;
    });
}
//# sourceMappingURL=publisher.js.map