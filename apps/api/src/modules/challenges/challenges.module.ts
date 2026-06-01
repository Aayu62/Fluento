import { Module } from '@nestjs/common';
import { ChallengesController } from './challenges.controller';
import { ChallengesService } from './challenges.service';
import { StreaksModule } from '../streaks/streaks.module';
import { EvaluationModule } from '../evaluation/evaluation.module';

@Module({
  imports: [StreaksModule, EvaluationModule],
  controllers: [ChallengesController],
  providers: [ChallengesService],
})
export class ChallengesModule {}
