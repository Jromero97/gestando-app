-- CreateEnum
CREATE TYPE "PregnancyCount" AS ENUM ('ONE', 'TWINS', 'MORE');

-- AlterTable
ALTER TABLE "pregnancy_profiles" ADD COLUMN     "babyCount" "PregnancyCount",
ADD COLUMN     "conditions" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "isFirstPregnancy" BOOLEAN,
ADD COLUMN     "primaryClinicName" TEXT,
ADD COLUMN     "primaryDoctorName" TEXT,
ADD COLUMN     "reminderAppointments" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "reminderDiaryNote" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "reminderDiaryNoteTime" TEXT,
ADD COLUMN     "reminderWeighIn" BOOLEAN NOT NULL DEFAULT true;
