import { IsIn, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  lastName?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  heightCm?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  prePregnancyWeightKg?: number;

  /** Which language push notification copy is sent in - kept in sync with the app's language switch. */
  @IsOptional()
  @IsIn(['es', 'en'])
  preferredLocale?: string;
}
