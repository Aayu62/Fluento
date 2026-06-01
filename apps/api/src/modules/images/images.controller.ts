import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ImagesService } from './images.service';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import type { Difficulty } from '@fluento/shared';

@ApiTags('image-study')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller('image-study')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Get('next')
  getNext(@Query('difficulty') difficulty?: Difficulty) {
    return this.imagesService.getRandomChallenge(difficulty);
  }
}
