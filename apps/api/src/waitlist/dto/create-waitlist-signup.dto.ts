import { IsEmail, MaxLength } from 'class-validator';

export class CreateWaitlistSignupDto {
  @IsEmail()
  @MaxLength(255)
  email!: string;
}
