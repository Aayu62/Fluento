import { Module } from '@nestjs/common';
import { ChallengesController } from './challenges.controller';
import { ChallengesService } from './challenges.service';
import { ImagesModule } from '../images/images.module';
import { StreaksModule } from '../streaks/streaks.module';
import { EvaluationModule } from '../evaluation/evaluation.module';

@Module({
  imports: [ImagesModule, StreaksModule, EvaluationModule],
  controllers: [ChallengesController],
  providers: [ChallengesService],
})
export class ChallengesModule {}
