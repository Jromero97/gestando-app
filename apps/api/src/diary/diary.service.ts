import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertDiaryEntryDto } from './dto/upsert-diary-entry.dto';
import { AddDiaryPhotoDto } from './dto/add-diary-photo.dto';
import { toDateKey, toDayRange, toDayStart } from './day-range.util';

export interface DayMark {
  date: string;
  hasAppointment: boolean;
  hasPhoto: boolean;
  hasSymptoms: boolean;
}

@Injectable()
export class DiaryService {
  constructor(private readonly prisma: PrismaService) {}

  async getDay(userId: string, dateStr: string) {
    const { start, end } = toDayRange(dateStr);

    const [appointments, exams, milestones, diaryEntry] = await Promise.all([
      this.prisma.appointment.findMany({ where: { userId, date: { gte: start, lt: end } }, orderBy: { date: 'asc' } }),
      this.prisma.exam.findMany({ where: { userId, date: { gte: start, lt: end } }, orderBy: { date: 'asc' } }),
      this.prisma.milestonePhoto.findMany({ where: { userId, date: { gte: start, lt: end } } }),
      this.prisma.diaryEntry.findUnique({
        where: { userId_date: { userId, date: start } },
        include: { photos: { orderBy: { createdAt: 'asc' } } },
      }),
    ]);

    return { date: start, appointments, exams, milestones, diaryEntry };
  }

  async upsertEntry(userId: string, dto: UpsertDiaryEntryDto) {
    const date = toDayStart(dto.date);
    const data = {
      note: dto.note,
      photoUrl: dto.photoUrl,
      mood: dto.mood,
      symptoms: dto.symptoms,
      weightKg: dto.weightKg,
      babyMovementsCount: dto.babyMovementsCount,
      sleepHours: dto.sleepHours,
      audioUrl: dto.audioUrl,
    };

    return this.prisma.diaryEntry.upsert({
      where: { userId_date: { userId, date } },
      create: { userId, date, ...data },
      update: data,
      include: { photos: { orderBy: { createdAt: 'asc' } } },
    });
  }

  async addPhoto(userId: string, dto: AddDiaryPhotoDto) {
    const date = toDayStart(dto.date);

    const entry = await this.prisma.diaryEntry.upsert({
      where: { userId_date: { userId, date } },
      create: { userId, date },
      update: {},
    });

    return this.prisma.diaryPhoto.create({
      data: { diaryEntryId: entry.id, photoUrl: dto.photoUrl, caption: dto.caption },
    });
  }

  async removePhoto(userId: string, photoId: string) {
    const photo = await this.prisma.diaryPhoto.findUnique({
      where: { id: photoId },
      include: { diaryEntry: true },
    });
    if (!photo) throw new NotFoundException('Photo not found');
    if (photo.diaryEntry.userId !== userId) throw new ForbiddenException();

    await this.prisma.diaryPhoto.delete({ where: { id: photoId } });
  }

  /**
   * Days of the month with content, split by category for the calendar's
   * multi-dot marking: appointment (appointments/exams), photo (milestone
   * or journal photos), symptoms (one or more symptoms logged that day).
   */
  async getMonthMarks(userId: string, year: number, month: number): Promise<DayMark[]> {
    if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
      throw new BadRequestException('Invalid year/month');
    }

    const start = new Date(Date.UTC(year, month - 1, 1));
    const end = new Date(Date.UTC(year, month, 1));
    const where = { userId, date: { gte: start, lt: end } };

    const [appointments, exams, milestones, diaryEntries, diaryPhotos] = await Promise.all([
      this.prisma.appointment.findMany({ where, select: { date: true } }),
      this.prisma.exam.findMany({ where, select: { date: true } }),
      this.prisma.milestonePhoto.findMany({ where, select: { date: true } }),
      this.prisma.diaryEntry.findMany({ where, select: { date: true, symptoms: true, photoUrl: true } }),
      this.prisma.diaryPhoto.findMany({
        where: { diaryEntry: where },
        select: { diaryEntry: { select: { date: true } } },
      }),
    ]);

    const marks = new Map<string, DayMark>();
    const ensure = (key: string) => {
      let mark = marks.get(key);
      if (!mark) {
        mark = { date: key, hasAppointment: false, hasPhoto: false, hasSymptoms: false };
        marks.set(key, mark);
      }
      return mark;
    };

    for (const row of appointments) ensure(toDateKey(row.date)).hasAppointment = true;
    for (const row of exams) ensure(toDateKey(row.date)).hasAppointment = true;
    for (const row of milestones) ensure(toDateKey(row.date)).hasPhoto = true;
    for (const row of diaryPhotos) ensure(toDateKey(row.diaryEntry.date)).hasPhoto = true;
    for (const row of diaryEntries) {
      const mark = ensure(toDateKey(row.date));
      if (row.photoUrl) mark.hasPhoto = true;
      if (row.symptoms.length > 0) mark.hasSymptoms = true;
    }

    return [...marks.values()].sort((a, b) => a.date.localeCompare(b.date));
  }
}
