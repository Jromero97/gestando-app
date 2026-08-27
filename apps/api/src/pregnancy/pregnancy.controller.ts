import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, RequestUser } from '../auth/current-user.decorator';
import { PregnancyService } from './pregnancy.service';
import { UpsertPregnancyProfileDto } from './dto/upsert-pregnancy-profile.dto';

@UseGuards(JwtAuthGuard)
@Controller('pregnancy')
export class PregnancyController {
  constructor(private readonly pregnancyService: PregnancyService) {}

  @Get('profile')
  getProfile(@CurrentUser() user: RequestUser) {
    return this.pregnancyService.getProfile(user.userId);
  }

  @Put('profile')
  upsertProfile(@CurrentUser() user: RequestUser, @Body() dto: UpsertPregnancyProfileDto) {
    return this.pregnancyService.upsertProfile(user.userId, dto);
  }

  @Get('gestational-age')
  getGestationalAge(@CurrentUser() user: RequestUser) {
    return this.pregnancyService.getCurrentGestationalAge(user.userId);
  }
}
