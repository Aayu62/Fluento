import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CallsModule } from './modules/calls/calls.module';
import { ChallengesModule } from './modules/challenges/challenges.module';
import { ImagesModule } from './modules/images/images.module';
import { TopicsModule } from './modules/topics/topics.module';
import { EvaluationModule } from './modules/evaluation/evaluation.module';
import { ProgressModule } from './modules/progress/progress.module';
import { StreaksModule } from './modules/streaks/streaks.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AdminModule } from './modules/admin/admin.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    ScheduleModule.forRoot(),
    DatabaseModule,
    AuthModule,
    UsersModule,
    CallsModule,
    ChallengesModule,
    ImagesModule,
    TopicsModule,
    EvaluationModule,
    ProgressModule,
    StreaksModule,
    NotificationsModule,
    AdminModule,
  ],
})
export class AppModule {}
