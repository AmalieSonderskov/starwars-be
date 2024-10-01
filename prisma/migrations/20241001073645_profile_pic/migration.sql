-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "wallet" REAL NOT NULL,
    "role" TEXT NOT NULL,
    "picture" TEXT NOT NULL DEFAULT '/assets/WattoProfile.png'
);
INSERT INTO "new_User" ("id", "name", "role", "wallet") SELECT "id", "name", "role", "wallet" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_name_key" ON "User"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
