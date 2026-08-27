import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { PushSenderService } from './push-sender.service';
import { ReminderSchedulerService } from './reminder-scheduler.service';

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService, PushSenderService, ReminderSchedulerService],
})
export class NotificationsModule {}
