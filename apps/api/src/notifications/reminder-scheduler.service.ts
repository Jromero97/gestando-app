import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PushSenderService } from './push-sender.service';
import { buildAppointmentCopy, buildExamCopy } from './reminder-copy';

/** Minutes before the item's date that a reminder should go out. */
const OFFSETS_MINUTES = [1440, 120] as const;

/**
 * Sends a push when a saved Appointment or Exam is coming up. Runs hourly
 * and, for each offset, scans a matching 1-hour-wide window so nothing is
 * missed or double-sent between ticks; NotificationLog's unique constraint
 * on (itemId, offsetMinutes) is the actual source of truth for "already
 * sent" - the query filter is just an optimization to avoid re-querying.
 */
@Injectable()
export class ReminderSchedulerService {
  private readonly logger = new Logger(ReminderSchedulerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly pushSender: PushSenderService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async sendDueReminders(): Promise<void> {
    for (const offsetMinutes of OFFSETS_MINUTES) {
      await this.remindAppointments(offsetMinutes);
      await this.remindExams(offsetMinutes);
    }
  }

  private async remindAppointments(offsetMinutes: (typeof OFFSETS_MINUTES)[number]) {
    const { windowStart, windowEnd } = this.window(offsetMinutes);
    const due = await this.prisma.appointment.findMany({
      where: {
        date: { gte: windowStart, lt: windowEnd },
        status: { notIn: ['CANCELLED', 'COMPLETED'] },
        user: { pregnancyProfile: { reminderAppointments: true } },
        notificationLogs: { none: { offsetMinutes } },
      },
      include: { user: true },
    });

    for (const appointment of due) {
      const copy = buildAppointmentCopy(appointment.title, appointment.date, offsetMinutes, appointment.user.preferredLocale);
      await this.pushSender.sendToUser(appointment.userId, {
        ...copy,
        data: { type: 'appointment', id: appointment.id },
      });
      await this.logSent({ appointmentId: appointment.id, offsetMinutes });
    }
  }

  private async remindExams(offsetMinutes: (typeof OFFSETS_MINUTES)[number]) {
    const { windowStart, windowEnd } = this.window(offsetMinutes);
    const due = await this.prisma.exam.findMany({
      where: {
        date: { gte: windowStart, lt: windowEnd },
        user: { pregnancyProfile: { reminderAppointments: true } },
        notificationLogs: { none: { offsetMinutes } },
      },
      include: { user: true },
    });

    for (const exam of due) {
      const copy = buildExamCopy(exam.title, offsetMinutes, exam.user.preferredLocale);
      await this.pushSender.sendToUser(exam.userId, {
        ...copy,
        data: { type: 'exam', id: exam.id },
      });
      await this.logSent({ examId: exam.id, offsetMinutes });
    }
  }

  private window(offsetMinutes: number) {
    const now = Date.now();
    return {
      windowStart: new Date(now + (offsetMinutes - 60) * 60_000),
      windowEnd: new Date(now + offsetMinutes * 60_000),
    };
  }

  private async logSent(data: { appointmentId?: string; examId?: string; offsetMinutes: number }) {
    try {
      await this.prisma.notificationLog.create({ data });
    } catch (err) {
      // Unique constraint race between overlapping ticks - already logged, safe to ignore.
      if (!(err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002')) {
        this.logger.error(`Failed to record sent reminder: ${err}`);
      }
    }
  }
}
