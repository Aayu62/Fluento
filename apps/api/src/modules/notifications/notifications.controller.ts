import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { RegisterPushTokenSchema, type RegisterPushTokenDto } from '@fluento/shared';
import type { User } from '@supabase/supabase-js';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('push-token')
  register(
    @CurrentUser() user: User,
    @Body(new ZodValidationPipe(RegisterPushTokenSchema)) dto: RegisterPushTokenDto,
  ) {
    return this.notificationsService.registerPushToken(user.id, dto.token, dto.platform);
  }
}
