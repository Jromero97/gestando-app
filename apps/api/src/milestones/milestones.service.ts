import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMilestoneDto } from './dto/create-milestone.dto';

@Injectable()
export class MilestonesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateMilestoneDto) {
    return this.prisma.milestonePhoto.create({
      data: {
        userId,
        weekNumber: dto.weekNumber,
        photoUrl: dto.photoUrl,
        weight: dto.weight,
        bellyCircumference: dto.bellyCircumference,
        notes: dto.notes,
        date: dto.date ? new Date(dto.date) : undefined,
      },
    });
  }

  /** Timeline ordered by pregnancy week, for the progress gallery */
  async findAllByWeek(userId: string) {
    return this.prisma.milestonePhoto.findMany({
      where: { userId },
      orderBy: { weekNumber: 'asc' },
    });
  }

  async remove(userId: string, id: string) {
    const photo = await this.prisma.milestonePhoto.findUnique({ where: { id } });
    if (!photo) throw new NotFoundException('Photo not found');
    if (photo.userId !== userId) throw new ForbiddenException();
    await this.prisma.milestonePhoto.delete({ where: { id } });
  }
}
