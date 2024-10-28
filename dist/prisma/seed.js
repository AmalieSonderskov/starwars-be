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
const builder_1 = require("../src/builder");
(function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const user1 = yield builder_1.prisma.user.create({
            data: {
                name: "Watto",
                wallet: 100000,
                role: "ADMIN",
            },
        });
        const user2 = yield builder_1.prisma.user.create({
            data: {
                name: "Luke",
                wallet: 10000,
                role: "USER",
            },
        });
        yield builder_1.prisma.item.createMany({
            data: [
                {
                    name: "Blue crystal",
                    type: "Kyber Crystal",
                    price: 5000,
                    description: "Good quality blue crystal",
                    userId: user1.id,
                    forSale: true,
                },
                {
                    name: "Silver hilt",
                    type: "Hilt",
                    price: 1000,
                    description: "Metal hilt for lightsabers",
                    userId: user1.id,
                    forSale: true,
                },
                {
                    name: "Gold hilt",
                    type: "Hilt",
                    price: 8000,
                    description: "Golden hilt, very rare",
                    userId: user1.id,
                    forSale: false,
                },
                {
                    name: "Green crystal",
                    type: "Kyber Crystal",
                    price: 4500,
                    description: "Good quality green crystal",
                    userId: user1.id,
                    forSale: true,
                },
            ],
        });
        console.log("Data seeded successfully!");
    });
})();
//# sourceMappingURL=seed.js.map