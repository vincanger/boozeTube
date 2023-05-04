-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Caption" (
    "videoId" TEXT NOT NULL,
    "videoTitle" TEXT,
    "thumbnail" TEXT,
    "youTuberId" TEXT NOT NULL,
    "captionChunks" TEXT NOT NULL,
    CONSTRAINT "Caption_youTuberId_fkey" FOREIGN KEY ("youTuberId") REFERENCES "YouTuber" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Caption" ("captionChunks", "videoId", "videoTitle", "youTuberId") SELECT "captionChunks", "videoId", "videoTitle", "youTuberId" FROM "Caption";
DROP TABLE "Caption";
ALTER TABLE "new_Caption" RENAME TO "Caption";
CREATE UNIQUE INDEX "Caption_videoId_key" ON "Caption"("videoId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
