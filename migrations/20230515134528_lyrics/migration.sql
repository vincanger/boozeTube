-- AlterTable
ALTER TABLE "Caption" ALTER COLUMN "transcribedWithLyrics" DROP NOT NULL,
ALTER COLUMN "transcribedWithLyrics" DROP DEFAULT;
