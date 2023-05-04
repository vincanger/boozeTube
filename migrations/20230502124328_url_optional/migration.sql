-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_YouTuber" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "url" TEXT
);
INSERT INTO "new_YouTuber" ("id", "name", "url") SELECT "id", "name", "url" FROM "YouTuber";
DROP TABLE "YouTuber";
ALTER TABLE "new_YouTuber" RENAME TO "YouTuber";
CREATE UNIQUE INDEX "YouTuber_id_key" ON "YouTuber"("id");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
