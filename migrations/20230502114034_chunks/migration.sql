/*
  Warnings:

  - You are about to drop the column `youTuber` on the `Caption` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "YouTuber" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "CaptionChunk" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "start" REAL NOT NULL,
    "dur" REAL NOT NULL,
    "text" TEXT NOT NULL,
    "captionId" TEXT,
    CONSTRAINT "CaptionChunk_captionId_fkey" FOREIGN KEY ("captionId") REFERENCES "Caption" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Caption" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "youTuberId" TEXT,
    CONSTRAINT "Caption_youTuberId_fkey" FOREIGN KEY ("youTuberId") REFERENCES "YouTuber" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Caption" ("content", "id") SELECT "content", "id" FROM "Caption";
DROP TABLE "Caption";
ALTER TABLE "new_Caption" RENAME TO "Caption";
CREATE UNIQUE INDEX "Caption_id_key" ON "Caption"("id");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "YouTuber_id_key" ON "YouTuber"("id");
