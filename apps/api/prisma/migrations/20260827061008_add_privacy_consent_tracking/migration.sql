-- AlterTable
ALTER TABLE "users" ADD COLUMN     "privacyPolicyAcceptedAt" TIMESTAMP(3),
ADD COLUMN     "privacyPolicyVersion" TEXT;
