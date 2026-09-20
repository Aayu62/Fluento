import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TopicsService } from './topics.service';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import type { TopicCategory, Difficulty, ThoughtExerciseFormat, ThoughtExercisePreparation } from '@fluento/shared';

@ApiTags('thought-exercise')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller('thought-exercise')
export class TopicsController {
  constructor(private readonly topicsService: TopicsService) {}

  @Get('next')
  getNext(
    @Query('category') category?: TopicCategory,
    @Query('difficulty') difficulty?: Difficulty,
    @Query('format') format?: ThoughtExerciseFormat,
    @Query('preparation') preparation?: ThoughtExercisePreparation,
  ) {
    return this.topicsService.getRandomExercise(category, difficulty, format, preparation);
  }
}
