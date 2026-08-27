import { Test } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { ReminderSchedulerService } from './reminder-scheduler.service';
import { PushSenderService } from './push-sender.service';
import { PrismaService } from '../prisma/prisma.service';

// @nestjs/schedule and expo-server-sdk both ship ESM-only, which the default
// ts-jest transform (node_modules excluded) can't parse. PushSenderService is
// provided as a full jest mock below so none of its Expo behavior is under
// test here, but its real file still gets `require`d transitively via
// ReminderSchedulerService's import - so expo-server-sdk needs a stub too.
jest.mock('@nestjs/schedule', () => ({
  Cron: () => () => undefined,
  CronExpression: { EVERY_HOUR: '0 * * * *' },
}));
jest.mock('expo-server-sdk', () => ({ __esModule: true, default: jest.fn(), Expo: jest.fn() }));

describe('ReminderSchedulerService', () => {
  let service: ReminderSchedulerService;
  const prismaMock = {
    appointment: { findMany: jest.fn() },
    exam: { findMany: jest.fn() },
    notificationLog: { create: jest.fn() },
  };
  const pushSenderMock = { sendToUser: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    prismaMock.appointment.findMany.mockResolvedValue([]);
    prismaMock.exam.findMany.mockResolvedValue([]);
    const moduleRef = await Test.createTestingModule({
      providers: [
        ReminderSchedulerService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: PushSenderService, useValue: pushSenderMock },
      ],
    }).compile();
    service = moduleRef.get(ReminderSchedulerService);
  });

  it('scans both offsets (24h and 2h) for both appointments and exams', async () => {
    await service.sendDueReminders();

    expect(prismaMock.appointment.findMany).toHaveBeenCalledTimes(2);
    expect(prismaMock.exam.findMany).toHaveBeenCalledTimes(2);
  });

  it('excludes cancelled/completed appointments, applies the reminder toggle, and dedupes on offsetMinutes', async () => {
    await service.sendDueReminders();

    expect(prismaMock.appointment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: { notIn: ['CANCELLED', 'COMPLETED'] },
          user: { pregnancyProfile: { reminderAppointments: true } },
          notificationLogs: { none: { offsetMinutes: 1440 } },
        }),
      }),
    );
  });

  it('sends a push and logs it for a due appointment', async () => {
    prismaMock.appointment.findMany.mockImplementation(({ where }: any) =>
      where.notificationLogs.none.offsetMinutes === 1440
        ? Promise.resolve([
            {
              id: 'appt-1',
              userId: 'user-1',
              title: 'Control obstétrico',
              date: new Date(),
              user: { preferredLocale: 'es' },
            },
          ])
        : Promise.resolve([]),
    );

    await service.sendDueReminders();

    expect(pushSenderMock.sendToUser).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({ data: { type: 'appointment', id: 'appt-1' } }),
    );
    expect(prismaMock.notificationLog.create).toHaveBeenCalledWith({
      data: { appointmentId: 'appt-1', offsetMinutes: 1440 },
    });
  });

  it('swallows a P2002 race on the notification log without throwing', async () => {
    prismaMock.exam.findMany.mockImplementation(({ where }: any) =>
      where.notificationLogs.none.offsetMinutes === 120
        ? Promise.resolve([{ id: 'exam-1', userId: 'user-1', title: 'Ecografía', user: { preferredLocale: 'es' } }])
        : Promise.resolve([]),
    );
    prismaMock.notificationLog.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('duplicate', { code: 'P2002', clientVersion: 'test' }),
    );

    await expect(service.sendDueReminders()).resolves.not.toThrow();
  });
});
