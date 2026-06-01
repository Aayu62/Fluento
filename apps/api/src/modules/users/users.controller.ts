import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { OnboardingSchema, type OnboardingDto } from '@fluento/shared';
import type { User } from '@supabase/supabase-js';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  getMe(@CurrentUser() authUser: User) {
    return this.usersService.getMe(authUser.id);
  }

  @Post('onboarding')
  @ApiOperation({ summary: 'Complete onboarding — save goals and skill level' })
  completeOnboarding(
    @CurrentUser() authUser: User,
    @Body(new ZodValidationPipe(OnboardingSchema)) dto: OnboardingDto,
  ) {
    return this.usersService.completeOnboarding(authUser.id, dto);
  }
}
