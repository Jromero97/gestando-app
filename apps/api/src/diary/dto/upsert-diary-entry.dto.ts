import { IsArray, IsDateString, IsEnum, IsInt, IsNumber, IsOptional, IsString, Min, MaxLength } from 'class-validator';
import { DiaryMood } from '@prisma/client';

export class UpsertDiaryEntryDto {
  @IsDateString()
  date!: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  note?: string;

  @IsOptional()
  @IsString()
  photoUrl?: string;

  @IsOptional()
  @IsEnum(DiaryMood)
  mood?: DiaryMood;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  symptoms?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  weightKg?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  babyMovementsCount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  sleepHours?: number;

  @IsOptional()
  @IsString()
  audioUrl?: string;
}
