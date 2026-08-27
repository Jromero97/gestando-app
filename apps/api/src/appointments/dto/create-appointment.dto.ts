import { IsBoolean, IsDateString, IsEnum, IsInt, IsNumber, IsOptional, IsString, Min, MaxLength } from 'class-validator';
import { AppointmentStatus } from '@prisma/client';

export class CreateAppointmentDto {
  @IsString()
  @MaxLength(120)
  title!: string;

  @IsDateString()
  date!: string;

  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @IsOptional()
  @IsBoolean()
  confirmed?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  doctorName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  bloodPressure?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  uterineHeightCm?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  fetalHeartRateBpm?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  estimatedBabyWeightG?: number;

  @IsOptional()
  @IsString()
  resultsFileUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  resultsFileName?: string;
}
