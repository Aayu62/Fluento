import { Module } from '@nestjs/common';
import { CallsController } from './calls.controller';
import { CallsService } from './calls.service';
import { StreaksModule } from '../streaks/streaks.module';
import { EvaluationModule } from '../evaluation/evaluation.module';

@Module({
  imports: [StreaksModule, EvaluationModule],
  controllers: [CallsController],
  providers: [CallsService],
  exports: [CallsService],
})
export class CallsModule {}
