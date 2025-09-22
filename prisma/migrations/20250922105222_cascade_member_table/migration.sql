-- DropForeignKey
ALTER TABLE "public"."Collaborator" DROP CONSTRAINT "Collaborator_projectId_fkey";

-- AddForeignKey
ALTER TABLE "public"."Collaborator" ADD CONSTRAINT "Collaborator_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
