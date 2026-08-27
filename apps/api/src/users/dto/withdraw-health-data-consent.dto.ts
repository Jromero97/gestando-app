import { IsString, MinLength } from 'class-validator';

export class WithdrawHealthDataConsentDto {
  /// Re-entering the password guards against a leaked/stolen JWT being used
  /// to irreversibly wipe a user's health data.
  @IsString()
  @MinLength(1)
  password!: string;
}
