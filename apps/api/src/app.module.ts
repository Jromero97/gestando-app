import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PregnancyModule } from './pregnancy/pregnancy.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { ExamsModule } from './exams/exams.module';
import { MilestonesModule } from './milestones/milestones.module';
// [DEPRECATED 2026-08-21 - Cloudinary unavailable in the user's country - j.romeroc97@gmail.com] replaced by StorageModule
// import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { StorageModule } from './storage/storage.module';
import { DiaryModule } from './diary/diary.module';
import { WaitlistModule } from './waitlist/waitlist.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Baseline for every route; auth/registration/waitlist/account-deletion
    // set tighter per-route limits with @Throttle (see their controllers).
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }]),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    UsersModule,
    PregnancyModule,
    AppointmentsModule,
    ExamsModule,
    MilestonesModule,
    // CloudinaryModule, // [DEPRECATED 2026-08-21] see StorageModule
    StorageModule,
    DiaryModule,
    WaitlistModule,
    NotificationsModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
