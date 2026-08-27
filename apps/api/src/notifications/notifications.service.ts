import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterPushTokenDto } from './dto/register-push-token.dto';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Upsert on `token` (not create) - logging in again on the same device
   * sends the same Expo token, and we don't want a duplicate row per login.
   */
  async registerToken(userId: string, dto: RegisterPushTokenDto) {
    await this.prisma.pushToken.upsert({
      where: { token: dto.token },
      update: { userId, platform: dto.platform },
      create: { userId, token: dto.token, platform: dto.platform },
    });
  }

  /**
   * Scoped to the caller's own tokens - deleteMany rather than delete so a
   * stale/already-removed token doesn't throw a P2025 "record not found".
   */
  async removeToken(userId: string, token: string) {
    await this.prisma.pushToken.deleteMany({ where: { userId, token } });
  }
}
