/*
  Warnings:

  - A unique constraint covering the columns `[id,updatedAt]` on the table `Column` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Column_id_updatedAt_key" ON "Column"("id", "updatedAt");
