import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { StreaksService } from './streaks.service';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { User } from '@supabase/supabase-js';

@ApiTags('streak')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller('streak')
export class StreaksController {
  constructor(private readonly streaksService: StreaksService) {}

  @Get()
  getStreak(@CurrentUser() user: User) {
    return this.streaksService.getStreak(user.id);
  }
}
