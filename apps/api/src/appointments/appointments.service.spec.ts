import { Test } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AppointmentsService', () => {
  let service: AppointmentsService;
  const prismaMock = {
    appointment: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn((ops: Promise<unknown>[]) => Promise.all(ops)),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [AppointmentsService, { provide: PrismaService, useValue: prismaMock }],
    }).compile();

    service = moduleRef.get(AppointmentsService);
  });

  it('findAll applies date range filter and pagination', async () => {
    prismaMock.appointment.findMany.mockResolvedValue([]);
    prismaMock.appointment.count.mockResolvedValue(0);

    await service.findAll('user-1', { page: 2, limit: 10, fromDate: '2026-01-01', toDate: '2026-12-31' });

    expect(prismaMock.appointment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId: 'user-1',
          date: { gte: new Date('2026-01-01'), lte: new Date('2026-12-31') },
        },
        skip: 10,
        take: 10,
      }),
    );
  });

  it('findOne throws NotFoundException when the appointment does not exist', async () => {
    prismaMock.appointment.findUnique.mockResolvedValue(null);

    await expect(service.findOne('user-1', 'apt-1')).rejects.toThrow(NotFoundException);
  });

  it('findOne throws ForbiddenException when the appointment belongs to another user', async () => {
    prismaMock.appointment.findUnique.mockResolvedValue({ id: 'apt-1', userId: 'other-user' });

    await expect(service.findOne('user-1', 'apt-1')).rejects.toThrow(ForbiddenException);
  });

  it('update passes the confirmed flag through to Prisma', async () => {
    prismaMock.appointment.findUnique.mockResolvedValue({ id: 'apt-1', userId: 'user-1' });
    prismaMock.appointment.update.mockResolvedValue({ id: 'apt-1', confirmed: true });

    await service.update('user-1', 'apt-1', { confirmed: true });

    expect(prismaMock.appointment.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'apt-1' },
        data: expect.objectContaining({ confirmed: true }),
      }),
    );
  });
});
