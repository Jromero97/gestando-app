import { IsString, MinLength } from 'class-validator';

export class DeleteAccountDto {
  /// Re-entering the password guards against a leaked/stolen JWT being used
  /// to irreversibly delete an account and all of its health data.
  @IsString()
  @MinLength(1)
  password!: string;
}
