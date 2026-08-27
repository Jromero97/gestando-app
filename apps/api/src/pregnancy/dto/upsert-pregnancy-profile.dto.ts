import { IsArray, IsBoolean, IsDateString, IsEnum, IsOptional, IsString, MaxLength, Matches } from 'class-validator';
import { PregnancyCount } from '@prisma/client';

export class UpsertPregnancyProfileDto {
  @IsOptional()
  @IsDateString()
  lastMenstrualPeriod?: string;

  @IsDateString()
  dueDate!: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  babyName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @IsOptional()
  @IsBoolean()
  isFirstPregnancy?: boolean;

  @IsOptional()
  @IsEnum(PregnancyCount)
  babyCount?: PregnancyCount;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  conditions?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(120)
  primaryDoctorName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  primaryClinicName?: string;

  @IsOptional()
  @IsBoolean()
  reminderAppointments?: boolean;

  @IsOptional()
  @IsBoolean()
  reminderWeighIn?: boolean;

  @IsOptional()
  @IsBoolean()
  reminderDiaryNote?: boolean;

  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'reminderDiaryNoteTime must be in HH:mm format' })
  reminderDiaryNoteTime?: string;
}
