/*
  Warnings:

  - The primary key for the `Caption` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Caption" (
    "videoId" TEXT NOT NULL,
    "youTuberId" TEXT NOT NULL,
    "captionChunks" TEXT NOT NULL,
    CONSTRAINT "Caption_youTuberId_fkey" FOREIGN KEY ("youTuberId") REFERENCES "YouTuber" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Caption" ("captionChunks", "videoId", "youTuberId") SELECT "captionChunks", "videoId", "youTuberId" FROM "Caption";
DROP TABLE "Caption";
ALTER TABLE "new_Caption" RENAME TO "Caption";
CREATE UNIQUE INDEX "Caption_videoId_key" ON "Caption"("videoId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
