import { Controller, Get, Post, Body, UseGuards, Query, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TopicsService } from './topics.service';
import { ChallengesService } from '../challenges/challenges.service';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { ThoughtExerciseSubmissionSchema, type ThoughtExerciseSubmissionDto } from '@fluento/shared';
import type { User } from '@supabase/supabase-js';
import type { TopicCategory, Difficulty, ThoughtExerciseFormat, ThoughtExercisePreparation } from '@fluento/shared';

@ApiTags('topics')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller('topics')
export class TopicsAliasController {
  constructor(
    private readonly topicsService: TopicsService,
    private readonly challengesService: ChallengesService,
  ) {}

  @Get()
  getAll(@Query('limit') limit?: string) {
    return this.topicsService.getAll(limit ? parseInt(limit, 10) : undefined);
  }

  @Get('random')
  getRandom(
    @Query('category') category?: TopicCategory, 
    @Query('difficulty') difficulty?: Difficulty,
    @Query('format') format?: ThoughtExerciseFormat,
    @Query('preparation') preparation?: ThoughtExercisePreparation
  ) {
    return this.topicsService.getRandomExercise(category, difficulty, format, preparation);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.topicsService.getById(id);
  }

  @Post('submit')
  submit(
    @CurrentUser() user: User,
    @Body(new ZodValidationPipe(ThoughtExerciseSubmissionSchema)) dto: ThoughtExerciseSubmissionDto,
  ) {
    return this.challengesService.submitThoughtExercise(user.id, dto);
  }
}
