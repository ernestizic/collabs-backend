-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "priority" "TaskPriority",
ADD COLUMN     "startDate" TIMESTAMP(3);
