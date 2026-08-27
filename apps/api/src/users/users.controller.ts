import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Patch, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, RequestUser } from '../auth/current-user.decorator';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { DeleteAccountDto } from './dto/delete-account.dto';
import { WithdrawHealthDataConsentDto } from './dto/withdraw-health-data-consent.dto';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getMe(@CurrentUser() user: RequestUser) {
    return this.usersService.findMe(user.userId);
  }

  @Patch('me')
  updateMe(@CurrentUser() user: RequestUser, @Body() dto: UpdateUserDto) {
    return this.usersService.updateMe(user.userId, dto);
  }

  // Requires re-entering the password (see DeleteAccountDto) - tighter than
  // the global default so it can't be used to brute-force it.
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeMe(@CurrentUser() user: RequestUser, @Body() dto: DeleteAccountDto) {
    await this.usersService.remove(user.userId, dto.password);
  }

  // Withdraws consent for health-data processing without deleting the
  // account (Washington MHMDA) - same password re-entry + throttle as
  // full account deletion, since it's also an irreversible data wipe.
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Delete('me/health-data')
  @HttpCode(HttpStatus.NO_CONTENT)
  async withdrawHealthDataConsent(@CurrentUser() user: RequestUser, @Body() dto: WithdrawHealthDataConsentDto) {
    await this.usersService.withdrawHealthDataConsent(user.userId, dto.password);
  }
}
