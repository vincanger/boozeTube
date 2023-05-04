/*
  Warnings:

  - You are about to drop the `Captions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Captions";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Caption" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "youTuber" TEXT NOT NULL
);
