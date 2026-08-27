import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertPregnancyProfileDto } from './dto/upsert-pregnancy-profile.dto';
import { calculateGestationalAge, GestationalAge } from './gestational-age.util';

@Injectable()
export class PregnancyService {
  constructor(private readonly prisma: PrismaService) {}

  async upsertProfile(userId: string, dto: UpsertPregnancyProfileDto) {
    const data = {
      lastMenstrualPeriod: dto.lastMenstrualPeriod ? new Date(dto.lastMenstrualPeriod) : undefined,
      dueDate: new Date(dto.dueDate),
      babyName: dto.babyName,
      notes: dto.notes,
      isFirstPregnancy: dto.isFirstPregnancy,
      babyCount: dto.babyCount,
      conditions: dto.conditions,
      primaryDoctorName: dto.primaryDoctorName,
      primaryClinicName: dto.primaryClinicName,
      reminderAppointments: dto.reminderAppointments,
      reminderWeighIn: dto.reminderWeighIn,
      reminderDiaryNote: dto.reminderDiaryNote,
      reminderDiaryNoteTime: dto.reminderDiaryNoteTime,
    };

    return this.prisma.pregnancyProfile.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    });
  }

  async getProfile(userId: string) {
    const profile = await this.prisma.pregnancyProfile.findUnique({ where: { userId } });
    if (!profile) {
      throw new NotFoundException('Pregnancy profile not found for this user');
    }
    return profile;
  }

  async getCurrentGestationalAge(userId: string): Promise<GestationalAge> {
    const profile = await this.prisma.pregnancyProfile.findUnique({ where: { userId } });
    if (!profile) {
      throw new NotFoundException('Pregnancy profile not found for this user');
    }

    return calculateGestationalAge({
      lastMenstrualPeriod: profile.lastMenstrualPeriod,
      dueDate: profile.dueDate,
    });
  }
}
