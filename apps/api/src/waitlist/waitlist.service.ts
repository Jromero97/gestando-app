import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWaitlistSignupDto } from './dto/create-waitlist-signup.dto';

@Injectable()
export class WaitlistService {
  constructor(private readonly prisma: PrismaService) {}

  /** Idempotent: resubmitting an email already on the list is a success, not an error. */
  async join(dto: CreateWaitlistSignupDto) {
    const email = dto.email.toLowerCase().trim();
    await this.prisma.waitlistSignup.upsert({
      where: { email },
      create: { email },
      update: {},
    });
    return { email, joined: true };
  }
}
