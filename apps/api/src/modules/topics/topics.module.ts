import { Module } from '@nestjs/common';
import { TopicsController } from './topics.controller';
import { TopicsService } from './topics.service';
import { TopicsAliasController } from './topics.alias.controller';
import { ChallengesModule } from '../challenges/challenges.module';

@Module({
  imports: [ChallengesModule],
  controllers: [TopicsController, TopicsAliasController],
  providers: [TopicsService],
  exports: [TopicsService],
})
export class TopicsModule {}
