/*
  Warnings:

  - You are about to drop the `CaptionChunk` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `captionChunks` to the `Caption` table without a default value. This is not possible if the table is not empty.
  - Made the column `youTuberId` on table `Caption` required. This step will fail if there are existing NULL values in that column.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "CaptionChunk";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Caption" (
    "videoId" TEXT NOT NULL PRIMARY KEY,
    "youTuberId" TEXT NOT NULL,
    "captionChunks" TEXT NOT NULL,
    CONSTRAINT "Caption_youTuberId_fkey" FOREIGN KEY ("youTuberId") REFERENCES "YouTuber" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Caption" ("videoId", "youTuberId") SELECT "videoId", "youTuberId" FROM "Caption";
DROP TABLE "Caption";
ALTER TABLE "new_Caption" RENAME TO "Caption";
CREATE UNIQUE INDEX "Caption_videoId_key" ON "Caption"("videoId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
