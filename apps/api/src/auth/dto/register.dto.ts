import { Equals, IsEmail, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email!: string;

  @MinLength(8)
  password!: string;

  /// Must be explicitly true - GDPR Art. 7(2) requires consent to be a distinct,
  /// affirmative action, not bundled in with account creation by default.
  @Equals(true, { message: 'You must accept the privacy policy to create an account' })
  acceptedPrivacyPolicy!: boolean;

  /// Separate from acceptedPrivacyPolicy - Washington's My Health My Data Act
  /// requires a distinct opt-in for collecting health data specifically, not
  /// bundled into general privacy-policy/ToS acceptance.
  @Equals(true, { message: 'You must consent to health data processing to create an account' })
  consentedToHealthData!: boolean;
}
