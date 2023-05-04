/*
  Warnings:

  - The primary key for the `Caption` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Caption` table. All the data in the column will be lost.
  - Added the required column `videoId` to the `Caption` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Caption" (
    "videoId" TEXT NOT NULL PRIMARY KEY,
    "youTuberId" TEXT,
    CONSTRAINT "Caption_youTuberId_fkey" FOREIGN KEY ("youTuberId") REFERENCES "YouTuber" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Caption" ("youTuberId") SELECT "youTuberId" FROM "Caption";
DROP TABLE "Caption";
ALTER TABLE "new_Caption" RENAME TO "Caption";
CREATE UNIQUE INDEX "Caption_videoId_key" ON "Caption"("videoId");
CREATE TABLE "new_CaptionChunk" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "start" REAL NOT NULL,
    "dur" REAL NOT NULL,
    "text" TEXT NOT NULL,
    "captionId" TEXT,
    CONSTRAINT "CaptionChunk_captionId_fkey" FOREIGN KEY ("captionId") REFERENCES "Caption" ("videoId") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_CaptionChunk" ("captionId", "dur", "id", "start", "text") SELECT "captionId", "dur", "id", "start", "text" FROM "CaptionChunk";
DROP TABLE "CaptionChunk";
ALTER TABLE "new_CaptionChunk" RENAME TO "CaptionChunk";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
