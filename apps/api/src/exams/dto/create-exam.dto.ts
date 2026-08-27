import { IsDateString, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ExamCategory } from '@prisma/client';

export class CreateExamDto {
  @IsString()
  @MaxLength(120)
  title!: string;

  @IsDateString()
  date!: string;

  @IsEnum(ExamCategory)
  category!: ExamCategory;

  @IsOptional()
  @IsString()
  fileUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
