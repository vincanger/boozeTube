/*
  Warnings:

  - You are about to drop the column `content` on the `Caption` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Caption" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "youTuberId" TEXT,
    CONSTRAINT "Caption_youTuberId_fkey" FOREIGN KEY ("youTuberId") REFERENCES "YouTuber" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Caption" ("id", "youTuberId") SELECT "id", "youTuberId" FROM "Caption";
DROP TABLE "Caption";
ALTER TABLE "new_Caption" RENAME TO "Caption";
CREATE UNIQUE INDEX "Caption_id_key" ON "Caption"("id");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
