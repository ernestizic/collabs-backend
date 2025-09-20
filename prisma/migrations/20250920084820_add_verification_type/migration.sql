-- CreateEnum
CREATE TYPE "public"."VerificationType" AS ENUM ('EMAIL_VERIFICATION', 'PASSWORD_RESET');

-- AlterTable
ALTER TABLE "public"."EmailVerification" ADD COLUMN     "type" "public"."VerificationType" NOT NULL DEFAULT 'EMAIL_VERIFICATION';
