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
exports.AuthObject = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const builder_1 = require("../builder");
exports.AuthObject = builder_1.builder.objectRef("AuthObject");
exports.AuthObject.implement({
    fields: (t) => ({
        user: t.prismaField({
            type: "User",
            resolve: (q, parent) => {
                return parent.user;
            },
        }),
        token: t.exposeString("token"),
    }),
});
builder_1.builder.mutationField("login", (t) => t.field({
    type: exports.AuthObject,
    args: {
        username: t.arg.string({ required: true }),
    },
    resolve: (_, args, ctx) => __awaiter(void 0, void 0, void 0, function* () {
        let user = yield builder_1.prisma.user.findUnique({
            where: { name: args.username },
        });
        if (!user) {
            user = yield builder_1.prisma.user.create({
                data: { name: args.username, wallet: 10000, role: "USER" },
            });
        }
        const token = (0, jsonwebtoken_1.sign)({ sub: user.id }, "secret");
        return { user, token, wallet: user.wallet, role: user.role };
    }),
}));
//# sourceMappingURL=auth.js.map