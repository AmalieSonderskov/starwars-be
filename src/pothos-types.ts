/* eslint-disable */
import type { Prisma, User, Item, Purchase, Transaction, Sale } from "@prisma/client";
export default interface PrismaTypes {
    User: {
        Name: "User";
        Shape: User;
        Include: Prisma.UserInclude;
        Select: Prisma.UserSelect;
        OrderBy: Prisma.UserOrderByWithRelationInput;
        WhereUnique: Prisma.UserWhereUniqueInput;
        Where: Prisma.UserWhereInput;
        Create: {};
        Update: {};
        RelationName: "items" | "Purchase" | "sales";
        ListRelations: "items" | "Purchase" | "sales";
        Relations: {
            items: {
                Shape: Item[];
                Name: "Item";
                Nullable: false;
            };
            Purchase: {
                Shape: Purchase[];
                Name: "Purchase";
                Nullable: false;
            };
            sales: {
                Shape: Sale[];
                Name: "Sale";
                Nullable: false;
            };
        };
    };
    Item: {
        Name: "Item";
        Shape: Item;
        Include: Prisma.ItemInclude;
        Select: Prisma.ItemSelect;
        OrderBy: Prisma.ItemOrderByWithRelationInput;
        WhereUnique: Prisma.ItemWhereUniqueInput;
        Where: Prisma.ItemWhereInput;
        Create: {};
        Update: {};
        RelationName: "user";
        ListRelations: never;
        Relations: {
            user: {
                Shape: User;
                Name: "User";
                Nullable: false;
            };
        };
    };
    Purchase: {
        Name: "Purchase";
        Shape: Purchase;
        Include: Prisma.PurchaseInclude;
        Select: Prisma.PurchaseSelect;
        OrderBy: Prisma.PurchaseOrderByWithRelationInput;
        WhereUnique: Prisma.PurchaseWhereUniqueInput;
        Where: Prisma.PurchaseWhereInput;
        Create: {};
        Update: {};
        RelationName: "buyer" | "transactions" | "sales";
        ListRelations: "transactions" | "sales";
        Relations: {
            buyer: {
                Shape: User;
                Name: "User";
                Nullable: false;
            };
            transactions: {
                Shape: Transaction[];
                Name: "Transaction";
                Nullable: false;
            };
            sales: {
                Shape: Sale[];
                Name: "Sale";
                Nullable: false;
            };
        };
    };
    Transaction: {
        Name: "Transaction";
        Shape: Transaction;
        Include: Prisma.TransactionInclude;
        Select: Prisma.TransactionSelect;
        OrderBy: Prisma.TransactionOrderByWithRelationInput;
        WhereUnique: Prisma.TransactionWhereUniqueInput;
        Where: Prisma.TransactionWhereInput;
        Create: {};
        Update: {};
        RelationName: "purchase";
        ListRelations: never;
        Relations: {
            purchase: {
                Shape: Purchase;
                Name: "Purchase";
                Nullable: false;
            };
        };
    };
    Sale: {
        Name: "Sale";
        Shape: Sale;
        Include: Prisma.SaleInclude;
        Select: Prisma.SaleSelect;
        OrderBy: Prisma.SaleOrderByWithRelationInput;
        WhereUnique: Prisma.SaleWhereUniqueInput;
        Where: Prisma.SaleWhereInput;
        Create: {};
        Update: {};
        RelationName: "seller" | "purchase";
        ListRelations: never;
        Relations: {
            seller: {
                Shape: User;
                Name: "User";
                Nullable: false;
            };
            purchase: {
                Shape: Purchase;
                Name: "Purchase";
                Nullable: false;
            };
        };
    };
}