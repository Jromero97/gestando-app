import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseStorageService } from '../storage/supabase-storage.service';
import { UpdateUserDto } from './dto/update-user.dto';

const PUBLIC_USER_SELECT = {
  id: true,
  email: true,
  role: true,
  firstName: true,
  lastName: true,
  heightCm: true,
  prePregnancyWeightKg: true,
  preferredLocale: true,
  createdAt: true,
} as const;

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: SupabaseStorageService,
  ) {}

  async findMe(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: PUBLIC_USER_SELECT });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateMe(userId: string, dto: UpdateUserDto) {
    return this.prisma.user.update({ where: { id: userId }, data: dto, select: PUBLIC_USER_SELECT });
  }

  /**
   * Right to erasure: permanently deletes the account, every row that
   * references it (cascades at the DB level - see the User relations in
   * schema.prisma), and any files the user uploaded to storage.
   */
  async remove(userId: string, password: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Incorrect password');
    }

    await this.storage.deleteAllForUser(userId);
    await this.prisma.user.delete({ where: { id: userId } });
  }
}
