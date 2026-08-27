import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

@Injectable()
export class AppointmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateAppointmentDto) {
    return this.prisma.appointment.create({
      data: {
        userId,
        title: dto.title,
        date: new Date(dto.date),
        doctorName: dto.doctorName,
        location: dto.location,
        notes: dto.notes,
      },
    });
  }

  async findAll(userId: string, query: PaginationQueryDto) {
    const where: Prisma.AppointmentWhereInput = {
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
      this.prisma.appointment.findMany({
        where,
        orderBy: { date: 'asc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.prisma.appointment.count({ where }),
    ]);

    return { items, total, page: query.page, limit: query.limit };
  }

  async findOne(userId: string, id: string) {
    const appointment = await this.prisma.appointment.findUnique({ where: { id } });
    if (!appointment) throw new NotFoundException('Appointment not found');
    if (appointment.userId !== userId) throw new ForbiddenException();
    return appointment;
  }

  async update(userId: string, id: string, dto: UpdateAppointmentDto) {
    await this.findOne(userId, id);
    return this.prisma.appointment.update({
      where: { id },
      data: {
        ...dto,
        date: dto.date ? new Date(dto.date) : undefined,
      },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    await this.prisma.appointment.delete({ where: { id } });
  }
}
