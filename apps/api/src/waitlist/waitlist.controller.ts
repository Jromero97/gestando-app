import { Body, Controller, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { WaitlistService } from './waitlist.service';
import { CreateWaitlistSignupDto } from './dto/create-waitlist-signup.dto';

@Controller('waitlist')
export class WaitlistController {
  constructor(private readonly waitlistService: WaitlistService) {}

  // Public, unauthenticated endpoint - tighter than the global default so it
  // can't be used to spam the table or as a cheap DoS vector.
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post()
  join(@Body() dto: CreateWaitlistSignupDto) {
    return this.waitlistService.join(dto);
  }
}
