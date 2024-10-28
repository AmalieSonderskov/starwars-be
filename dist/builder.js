"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.builder = exports.prisma = void 0;
const client_1 = require("@prisma/client");
const core_1 = __importDefault(require("@pothos/core"));
const plugin_prisma_1 = __importDefault(require("@pothos/plugin-prisma"));
exports.prisma = new client_1.PrismaClient();
exports.builder = new core_1.default({
    plugins: [plugin_prisma_1.default],
    prisma: {
        client: exports.prisma,
        // use where clause from prismaRelatedConnection for totalCount (defaults to true)
        filterConnectionTotalCount: true,
        // warn when not using a query parameter correctly
        onUnusedQuery: process.env.NODE_ENV === "production" ? null : "warn",
    },
});
//# sourceMappingURL=builder.js.map