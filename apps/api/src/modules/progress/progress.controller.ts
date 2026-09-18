import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ProgressService } from './progress.service';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { User } from '@supabase/supabase-js';
import type { ProgressRange } from '@fluento/shared';

@ApiTags('progress')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get('dashboard')
  getDashboard(@CurrentUser() user: User) {
    return this.progressService.getDashboard(user.id);
  }

  @Get('history')
  getHistory(
    @CurrentUser() user: User,
    @Query('range') range: ProgressRange = 'weekly',
  ) {
    return this.progressService.getProgressHistory(user.id, range);
  }

  @Get('sessions')
  @ApiOperation({ summary: 'Get paginated past sessions' })
  getSessions(
    @CurrentUser() user: User,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('type') type?: string,
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const offset = (pageNum - 1) * limitNum;
    return this.progressService.getSessions(user.id, offset, limitNum, type);
  }
}
