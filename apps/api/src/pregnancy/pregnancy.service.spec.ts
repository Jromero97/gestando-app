import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PregnancyService } from './pregnancy.service';
import { PrismaService } from '../prisma/prisma.service';

describe('PregnancyService', () => {
  let service: PregnancyService;
  const prismaMock = {
    pregnancyProfile: {
      upsert: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [PregnancyService, { provide: PrismaService, useValue: prismaMock }],
    }).compile();

    service = moduleRef.get(PregnancyService);
  });

  it('upsertProfile leaves the LMP untouched (not wiped) when none is sent', async () => {
    prismaMock.pregnancyProfile.upsert.mockResolvedValue({ id: '1' });

    await service.upsertProfile('user-1', { dueDate: '2026-11-08' });

    expect(prismaMock.pregnancyProfile.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'user-1' },
        update: expect.objectContaining({ lastMenstrualPeriod: undefined }),
      }),
    );
  });

  it('upsertProfile saves pregnancy details, doctor/clinic and reminder preferences', async () => {
    prismaMock.pregnancyProfile.upsert.mockResolvedValue({ id: '1' });

    await service.upsertProfile('user-1', {
      dueDate: '2026-11-08',
      isFirstPregnancy: true,
      babyCount: 'TWINS',
      conditions: ['ANEMIA', 'HYPERTENSION'],
      primaryDoctorName: 'Dra. Camila Rojas',
      primaryClinicName: 'Clinica Bio Salud',
      reminderAppointments: true,
      reminderWeighIn: false,
      reminderDiaryNote: true,
      reminderDiaryNoteTime: '21:00',
    });

    expect(prismaMock.pregnancyProfile.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          isFirstPregnancy: true,
          babyCount: 'TWINS',
          conditions: ['ANEMIA', 'HYPERTENSION'],
          primaryDoctorName: 'Dra. Camila Rojas',
          primaryClinicName: 'Clinica Bio Salud',
          reminderAppointments: true,
          reminderWeighIn: false,
          reminderDiaryNote: true,
          reminderDiaryNoteTime: '21:00',
        }),
      }),
    );
  });

  it('getProfile throws NotFoundException when there is no profile', async () => {
    prismaMock.pregnancyProfile.findUnique.mockResolvedValue(null);

    await expect(service.getProfile('user-1')).rejects.toThrow(NotFoundException);
  });

  it('getCurrentGestationalAge throws NotFoundException when there is no profile', async () => {
    prismaMock.pregnancyProfile.findUnique.mockResolvedValue(null);

    await expect(service.getCurrentGestationalAge('user-1')).rejects.toThrow(NotFoundException);
  });

  it('getCurrentGestationalAge computes gestational age from the saved profile', async () => {
    prismaMock.pregnancyProfile.findUnique.mockResolvedValue({
      lastMenstrualPeriod: new Date('2026-02-01T00:00:00.000Z'),
      dueDate: new Date('2026-11-08T00:00:00.000Z'),
    });

    const result = await service.getCurrentGestationalAge('user-1');

    expect(result.weeks).toBeGreaterThanOrEqual(0);
    expect(result.trimester).toBeGreaterThanOrEqual(1);
  });
});
