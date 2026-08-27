-- AlterTable
ALTER TABLE "users" ADD COLUMN     "healthDataConsentAt" TIMESTAMP(3),
ADD COLUMN     "healthDataConsentWithdrawnAt" TIMESTAMP(3);
