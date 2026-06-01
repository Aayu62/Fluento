import { Module } from '@nestjs/common';
import { ProgressController } from './progress.controller';
import { ProgressService } from './progress.service';
import { CallsModule } from '../calls/calls.module';
import { StreaksModule } from '../streaks/streaks.module';
import { TopicsModule } from '../topics/topics.module';

@Module({
  imports: [CallsModule, StreaksModule, TopicsModule],
  controllers: [ProgressController],
  providers: [ProgressService],
})
export class ProgressModule {}
