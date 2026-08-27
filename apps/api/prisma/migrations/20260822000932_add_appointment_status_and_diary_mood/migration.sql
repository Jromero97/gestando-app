-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('PENDIENTE', 'EN_CURSO', 'REALIZADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "DiaryMood" AS ENUM ('GENIAL', 'BIEN', 'NORMAL', 'CANSADA', 'MAL');

-- AlterTable
ALTER TABLE "appointments" ADD COLUMN     "status" "AppointmentStatus" NOT NULL DEFAULT 'PENDIENTE';

-- AlterTable
ALTER TABLE "diary_entries" ADD COLUMN     "mood" "DiaryMood";
