-- CreateTable
CREATE TABLE "YouTuber" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT,

    CONSTRAINT "YouTuber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Caption" (
    "videoId" TEXT NOT NULL,
    "videoTitle" TEXT,
    "thumbnail" TEXT,
    "youTuberId" TEXT NOT NULL,
    "captionChunks" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "YouTuber_id_key" ON "YouTuber"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Caption_videoId_key" ON "Caption"("videoId");

-- AddForeignKey
ALTER TABLE "Caption" ADD CONSTRAINT "Caption_youTuberId_fkey" FOREIGN KEY ("youTuberId") REFERENCES "YouTuber"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
