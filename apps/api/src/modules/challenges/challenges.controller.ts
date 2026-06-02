import { Controller, Get, Post, Body, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ChallengesService } from './challenges.service';
import { ImagesService } from '../images/images.service';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import {
  ImageSubmissionSchema,
  ThoughtExerciseSubmissionSchema,
  type ImageSubmissionDto,
  type ThoughtExerciseSubmissionDto,
  type Difficulty,
} from '@fluento/shared';
import type { User } from '@supabase/supabase-js';

@ApiTags('challenges')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller('challenges')
export class ChallengesController {
  constructor(
    private readonly challengesService: ChallengesService,
    private readonly imagesService: ImagesService,
  ) {}

  @Post('image/submit')
  submitImage(
    @CurrentUser() user: User,
    @Body(new ZodValidationPipe(ImageSubmissionSchema)) dto: ImageSubmissionDto,
  ) {
    return this.challengesService.submitImageStudy(user.id, dto);
  }

  @Post('thought/submit')
  submitThought(
    @CurrentUser() user: User,
    @Body(new ZodValidationPipe(ThoughtExerciseSubmissionSchema)) dto: ThoughtExerciseSubmissionDto,
  ) {
    return this.challengesService.submitThoughtExercise(user.id, dto);
  }

  @Get('image')
  getImageChallenge(@Query('difficulty') difficulty?: Difficulty) {
    return this.imagesService.getRandomChallenge(difficulty);
  }
}
