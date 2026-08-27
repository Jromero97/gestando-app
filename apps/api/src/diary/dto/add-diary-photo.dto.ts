import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

export class AddDiaryPhotoDto {
  @IsDateString()
  date!: string;

  @IsString()
  photoUrl!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  caption?: string;
}
