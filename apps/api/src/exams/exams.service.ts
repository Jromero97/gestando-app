import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

@Injectable()
export class ExamsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateExamDto) {
    return this.prisma.exam.create({
      data: { userId, ...dto, date: new Date(dto.date) },
    });
  }

  async findAll(userId: string, query: PaginationQueryDto) {
    const where: Prisma.ExamWhereInput = {
      userId,
      ...(query.fromDate || query.toDate
        ? {
            date: {
              ...(query.fromDate ? { gte: new Date(query.fromDate) } : {}),
              ...(query.toDate ? { lte: new Date(query.toDate) } : {}),
            },
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.exam.findMany({
        where,
        orderBy: { date: 'desc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.prisma.exam.count({ where }),
    ]);

    return { items, total, page: query.page, limit: query.limit };
  }

  async findOne(userId: string, id: string) {
    const exam = await this.prisma.exam.findUnique({ where: { id } });
    if (!exam) throw new NotFoundException('Exam not found');
    if (exam.userId !== userId) throw new ForbiddenException();
    return exam;
  }

  async update(userId: string, id: string, dto: UpdateExamDto) {
    await this.findOne(userId, id);
    return this.prisma.exam.update({
      where: { id },
      data: { ...dto, date: dto.date ? new Date(dto.date) : undefined },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    await this.prisma.exam.delete({ where: { id } });
  }
}
