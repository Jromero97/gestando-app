import { IsDateString, IsInt, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class CreateMilestoneDto {
  @IsInt()
  @Min(0)
  @Max(45)
  weekNumber!: number;

  @IsString()
  photoUrl!: string;

  @IsOptional()
  @IsNumber()
  weight?: number;

  @IsOptional()
  @IsNumber()
  bellyCircumference?: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @IsOptional()
  @IsDateString()
  date?: string;
}
