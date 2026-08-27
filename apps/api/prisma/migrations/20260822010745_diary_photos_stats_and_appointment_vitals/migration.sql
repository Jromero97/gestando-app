-- AlterTable
ALTER TABLE "appointments" ADD COLUMN     "bloodPressure" TEXT,
ADD COLUMN     "estimatedBabyWeightG" INTEGER,
ADD COLUMN     "fetalHeartRateBpm" INTEGER,
ADD COLUMN     "resultsFileName" TEXT,
ADD COLUMN     "resultsFileUrl" TEXT,
ADD COLUMN     "uterineHeightCm" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "diary_entries" ADD COLUMN     "audioUrl" TEXT,
ADD COLUMN     "babyMovementsCount" INTEGER,
ADD COLUMN     "sleepHours" DOUBLE PRECISION,
ADD COLUMN     "weightKg" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "diary_photos" (
    "id" TEXT NOT NULL,
    "diaryEntryId" TEXT NOT NULL,
    "photoUrl" TEXT NOT NULL,
    "caption" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "diary_photos_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "diary_photos" ADD CONSTRAINT "diary_photos_diaryEntryId_fkey" FOREIGN KEY ("diaryEntryId") REFERENCES "diary_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
