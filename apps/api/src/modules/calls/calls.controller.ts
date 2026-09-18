import { Controller, Get, Post, Body, Param, UseGuards, UseInterceptors, UploadedFile, Res, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
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
  @ApiOperation({ summary: 'Start a scheduled voice call' })
  startCall(@CurrentUser() user: User, @Param('id') callId: string) {
    return this.callsService.startCall(user.id, callId);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel a scheduled voice call' })
  cancelCall(@CurrentUser() user: User, @Param('id') callId: string) {
    return this.callsService.cancelCall(user.id, callId);
  }

  @Post(':id/end')
  @ApiOperation({ summary: 'End an active call and evaluate' })
  endCall(@CurrentUser() user: User, @Param('id') id: string) {
    return this.callsService.endCall(user.id, id);
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


  @Get(':id/report')
  getReport(@CurrentUser() user: User, @Param('id') id: string) {
    return this.callsService.getReport(user.id, id);
  }

  @Post('stt')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async proxyStt(@UploadedFile() file: Express.Multer.File) {
    return this.callsService.proxyStt(file);
  }

  @Post('tts')
  async proxyTts(@Body('text') text: string, @Res() res: Response) {
    const buffer = await this.callsService.proxyTts(text);
    res.setHeader('Content-Type', 'audio/wav');
    res.send(buffer);
  }

  @Get('tts')
  async proxyTtsGet(@Query('text') text: string, @Res() res: Response) {
    const buffer = await this.callsService.proxyTts(text);
    res.setHeader('Content-Type', 'audio/wav');
    res.send(buffer);
  }
}
