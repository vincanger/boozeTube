/*
  Warnings:

  - A unique constraint covering the columns `[id]` on the table `Caption` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Caption_id_key" ON "Caption"("id");
