import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CallsService } from './calls.service';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import {
  AddCallTurnSchema,
  ScheduleCallSchema,
  type AddCallTurnDto,
  type ScheduleCallDto,
} from '@fluento/shared';
import type { User } from '@supabase/supabase-js';

@ApiTags('calls')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller('calls')
export class CallsController {
  constructor(private readonly callsService: CallsService) {}

  @Get('scenarios')
  getScenarios() {
    return this.callsService.getScenarios();
  }

  @Post('schedule')
  schedule(
    @CurrentUser() user: User,
    @Body(new ZodValidationPipe(ScheduleCallSchema)) dto: ScheduleCallDto,
  ) {
    return this.callsService.scheduleCall(user.id, dto);
  }

  @Get('upcoming')
  getUpcoming(@CurrentUser() user: User) {
    return this.callsService.getUpcoming(user.id);
  }

  @Get(':id')
  getCall(@CurrentUser() user: User, @Param('id') id: string) {
    return this.callsService.getCall(user.id, id);
  }

  @Post(':id/start')
  startCall(@CurrentUser() user: User, @Param('id') id: string) {
    return this.callsService.startCall(user.id, id);
  }

  @Post(':id/decline')
  declineCall(@CurrentUser() user: User, @Param('id') id: string) {
    return this.callsService.declineCall(user.id, id);
  }

  @Post(':id/turns')
  addCallTurn(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(AddCallTurnSchema)) dto: AddCallTurnDto,
  ) {
    return this.callsService.addConversationTurn(user.id, id, dto.role, dto.content);
  }

  @Get(':id/turns')
  getCallTurns(@CurrentUser() user: User, @Param('id') id: string) {
    return this.callsService.getCallTurns(user.id, id);
  }

  @Post(':id/end')
  endCall(@CurrentUser() user: User, @Param('id') id: string) {
    return this.callsService.endCall(user.id, id);
  }

  @Get(':id/report')
  getReport(@CurrentUser() user: User, @Param('id') id: string) {
    return this.callsService.getReport(user.id, id);
  }
}
