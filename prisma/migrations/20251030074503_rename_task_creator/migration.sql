/*
  Warnings:

  - You are about to drop the column `collaboratorId` on the `Task` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Task" DROP CONSTRAINT "Task_collaboratorId_fkey";

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "collaboratorId",
ADD COLUMN     "creatorId" INTEGER;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Collaborator"("id") ON DELETE SET NULL ON UPDATE CASCADE;
