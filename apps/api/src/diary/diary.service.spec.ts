import { Test } from '@nestjs/testing';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { DiaryService } from './diary.service';
import { PrismaService } from '../prisma/prisma.service';

describe('DiaryService', () => {
  let service: DiaryService;
  const prismaMock = {
    appointment: { findMany: jest.fn() },
    exam: { findMany: jest.fn() },
    milestonePhoto: { findMany: jest.fn() },
    diaryEntry: { findUnique: jest.fn(), findMany: jest.fn(), upsert: jest.fn() },
    diaryPhoto: { findMany: jest.fn(), create: jest.fn(), findUnique: jest.fn(), delete: jest.fn() },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    prismaMock.diaryPhoto.findMany.mockResolvedValue([]);
    const moduleRef = await Test.createTestingModule({
      providers: [DiaryService, { provide: PrismaService, useValue: prismaMock }],
    }).compile();
    service = moduleRef.get(DiaryService);
  });

  it('getDay normalizes the date to UTC midnight and queries all 4 sources', async () => {
    prismaMock.appointment.findMany.mockResolvedValue([]);
    prismaMock.exam.findMany.mockResolvedValue([]);
    prismaMock.milestonePhoto.findMany.mockResolvedValue([]);
    prismaMock.diaryEntry.findUnique.mockResolvedValue(null);

    const result = await service.getDay('user-1', '2026-08-21T15:30:00.000Z');

    expect(result.date.toISOString()).toBe('2026-08-21T00:00:00.000Z');
    expect(prismaMock.appointment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId: 'user-1',
          date: { gte: new Date('2026-08-21T00:00:00.000Z'), lt: new Date('2026-08-22T00:00:00.000Z') },
        },
      }),
    );
    expect(prismaMock.diaryEntry.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId_date: { userId: 'user-1', date: new Date('2026-08-21T00:00:00.000Z') } },
      }),
    );
  });

  it('upsertEntry normalizes the date before saving', async () => {
    prismaMock.diaryEntry.upsert.mockResolvedValue({ id: '1' });

    await service.upsertEntry('user-1', { date: '2026-08-21', note: 'Feeling good today' });

    expect(prismaMock.diaryEntry.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId_date: { userId: 'user-1', date: new Date('2026-08-21T00:00:00.000Z') } },
      }),
    );
  });

  it('upsertEntry saves the symptoms array and daily stats', async () => {
    prismaMock.diaryEntry.upsert.mockResolvedValue({ id: '1' });

    await service.upsertEntry('user-1', {
      date: '2026-08-21',
      symptoms: ['NAUSEA', 'HEARTBURN'],
      weightKg: 64.8,
      babyMovementsCount: 14,
      sleepHours: 7.5,
    });

    expect(prismaMock.diaryEntry.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          symptoms: ['NAUSEA', 'HEARTBURN'],
          weightKg: 64.8,
          babyMovementsCount: 14,
          sleepHours: 7.5,
        }),
      }),
    );
  });

  it('addPhoto upserts an entry for the day (creating it if needed) and attaches the photo', async () => {
    prismaMock.diaryEntry.upsert.mockResolvedValue({ id: 'entry-1' });
    prismaMock.diaryPhoto.create.mockResolvedValue({ id: 'photo-1' });

    await service.addPhoto('user-1', { date: '2026-08-21', photoUrl: 'https://x/panza.jpg', caption: 'Panza s24' });

    expect(prismaMock.diaryEntry.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId_date: { userId: 'user-1', date: new Date('2026-08-21T00:00:00.000Z') } } }),
    );
    expect(prismaMock.diaryPhoto.create).toHaveBeenCalledWith({
      data: { diaryEntryId: 'entry-1', photoUrl: 'https://x/panza.jpg', caption: 'Panza s24' },
    });
  });

  it('removePhoto throws NotFoundException when the photo does not exist', async () => {
    prismaMock.diaryPhoto.findUnique.mockResolvedValue(null);

    await expect(service.removePhoto('user-1', 'photo-1')).rejects.toThrow(NotFoundException);
  });

  it('removePhoto throws ForbiddenException when the photo belongs to another user', async () => {
    prismaMock.diaryPhoto.findUnique.mockResolvedValue({ id: 'photo-1', diaryEntry: { userId: 'other-user' } });

    await expect(service.removePhoto('user-1', 'photo-1')).rejects.toThrow(ForbiddenException);
    expect(prismaMock.diaryPhoto.delete).not.toHaveBeenCalled();
  });

  it('getMonthMarks throws BadRequestException on an invalid month', async () => {
    await expect(service.getMonthMarks('user-1', 2026, 13)).rejects.toThrow(BadRequestException);
  });

  it('getMonthMarks groups by day and categorizes appointment/photo/symptoms without duplicating days', async () => {
    prismaMock.appointment.findMany.mockResolvedValue([{ date: new Date('2026-08-03T10:00:00.000Z') }]);
    prismaMock.exam.findMany.mockResolvedValue([{ date: new Date('2026-08-03T18:00:00.000Z') }]);
    prismaMock.milestonePhoto.findMany.mockResolvedValue([{ date: new Date('2026-08-10T00:00:00.000Z') }]);
    prismaMock.diaryEntry.findMany.mockResolvedValue([
      { date: new Date('2026-08-15T00:00:00.000Z'), symptoms: ['NAUSEA'], photoUrl: null },
      { date: new Date('2026-08-20T00:00:00.000Z'), symptoms: [], photoUrl: null },
    ]);
    prismaMock.diaryPhoto.findMany.mockResolvedValue([{ diaryEntry: { date: new Date('2026-08-20T00:00:00.000Z') } }]);

    const result = await service.getMonthMarks('user-1', 2026, 8);

    expect(result).toEqual([
      { date: '2026-08-03', hasAppointment: true, hasPhoto: false, hasSymptoms: false },
      { date: '2026-08-10', hasAppointment: false, hasPhoto: true, hasSymptoms: false },
      { date: '2026-08-15', hasAppointment: false, hasPhoto: false, hasSymptoms: true },
      { date: '2026-08-20', hasAppointment: false, hasPhoto: true, hasSymptoms: false },
    ]);
  });
});
