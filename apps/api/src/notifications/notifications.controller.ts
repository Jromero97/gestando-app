import { Body, Controller, Delete, HttpCode, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, RequestUser } from '../auth/current-user.decorator';
import { NotificationsService } from './notifications.service';
import { RegisterPushTokenDto } from './dto/register-push-token.dto';
import { RemovePushTokenDto } from './dto/remove-push-token.dto';

@UseGuards(JwtAuthGuard)
@Controller('users/me/push-tokens')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @HttpCode(204)
  register(@CurrentUser() user: RequestUser, @Body() dto: RegisterPushTokenDto) {
    return this.notificationsService.registerToken(user.userId, dto);
  }

  @Delete()
  @HttpCode(204)
  remove(@CurrentUser() user: RequestUser, @Body() dto: RemovePushTokenDto) {
    return this.notificationsService.removeToken(user.userId, dto.token);
  }
}
