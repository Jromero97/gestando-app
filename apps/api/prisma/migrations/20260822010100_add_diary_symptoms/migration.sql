-- AlterTable
ALTER TABLE "diary_entries" ADD COLUMN     "symptoms" TEXT[] DEFAULT ARRAY[]::TEXT[];
