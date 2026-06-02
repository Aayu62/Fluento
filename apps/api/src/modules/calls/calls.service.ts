import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { StreaksService } from '../streaks/streaks.service';
import { EvaluationService } from '../evaluation/evaluation.service';
import type { ScheduledCall, CallScenario, SessionReport } from '@fluento/shared';
import type { ScheduleCallDto } from '@fluento/shared';

@Injectable()
export class CallsService {
  private readonly logger = new Logger(CallsService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly streaks: StreaksService,
    private readonly evaluation: EvaluationService,
  ) {}

  async scheduleCall(userId: string, dto: ScheduleCallDto): Promise<ScheduledCall> {
    const scheduledTime = new Date(dto.scheduledTime);
    if (scheduledTime <= new Date()) {
      throw new BadRequestException('Scheduled time must be in the future');
    }

    const scenario = await this.db.findOne<Record<string, unknown>>(
      'call_scenarios',
      { id: dto.scenarioId, is_active: true },
    );
    if (!scenario) throw new NotFoundException('Scenario not found');

    const row = await this.db.insert<Record<string, unknown>>('scheduled_calls', {
      user_id: userId,
      scenario_id: dto.scenarioId,
      scheduled_time: dto.scheduledTime,
      status: 'scheduled',
      conversation_history: [],
    });

    await this.db.logActivity(userId, 'call_scheduled', { scenario_id: dto.scenarioId });

    return this.mapCall(row, this.mapScenario(scenario));
  }

  async getUpcoming(userId: string): Promise<ScheduledCall[]> {
    const { data } = await this.db.client
      .from('scheduled_calls')
      .select('*, call_scenarios(*)')
      .eq('user_id', userId)
      .eq('status', 'scheduled')
      .gte('scheduled_time', new Date().toISOString())
      .order('scheduled_time', { ascending: true })
      .limit(5);

    return (data ?? []).map((row: Record<string, unknown>) =>
      this.mapCall(row, this.mapScenario(row['call_scenarios'] as Record<string, unknown>)),
    );
  }

  async getCall(userId: string, callId: string): Promise<ScheduledCall> {
    const { data } = await this.db.client
      .from('scheduled_calls')
      .select('*, call_scenarios(*)')
      .eq('id', callId)
      .eq('user_id', userId)
      .maybeSingle();

    if (!data) throw new NotFoundException('Call not found');
    return this.mapCall(data, this.mapScenario(data['call_scenarios'] as Record<string, unknown>));
  }

  async startCall(userId: string, callId: string): Promise<ScheduledCall> {
    const call = await this.db.findOne<Record<string, unknown>>(
      'scheduled_calls',
      { id: callId, user_id: userId },
    );
    if (!call) throw new NotFoundException('Call not found');
    if (call['status'] !== 'scheduled') {
      throw new BadRequestException(`Call cannot be started — status is ${call['status'] as string}`);
    }

    const updated = await this.db.update<Record<string, unknown>>(
      'scheduled_calls',
      { id: callId },
      { status: 'active', updated_at: new Date().toISOString() },
    );

    await this.db.logActivity(userId, 'call_started', { call_id: callId });
    return this.mapCall(updated);
  }

  async endCall(userId: string, callId: string): Promise<SessionReport> {
    const call = await this.db.findOne<Record<string, unknown>>(
      'scheduled_calls',
      { id: callId, user_id: userId },
    );
    if (!call) throw new NotFoundException('Call not found');
    if (call['status'] !== 'active') {
      throw new BadRequestException('Call is not active');
    }

    const history = (call['conversation_history'] as unknown[]) ?? [];
    const transcript = history
      .filter((t): t is Record<string, string> => typeof t === 'object' && t !== null)
      .filter((t) => t['role'] === 'user')
      .map((t) => t['content'])
      .join(' ');

    const result = await this.evaluation.evaluate({
      sessionType: 'voice_call',
      userResponse: transcript || 'No transcript available',
      contextData: { callId, scenarioId: call['scenario_id'] },
    });

    await this.db.update('scheduled_calls', { id: callId }, {
      status: 'completed',
      updated_at: new Date().toISOString(),
    });

    const report = await this.db.insert<Record<string, unknown>>('session_reports', {
      user_id: userId,
      session_type: 'voice_call',
      session_id: callId,
      score_json: result.scores,
      feedback: result.feedback,
      strengths: result.strengths,
      improvements: result.improvements,
      recommendations: result.recommendations,
    });

    const rollingUpdates: Partial<Record<'fluency' | 'grammar' | 'vocabulary', number>> = {};
    if (result.scores.fluency !== undefined) rollingUpdates.fluency = result.scores.fluency;
    if (result.scores.grammar !== undefined) rollingUpdates.grammar = result.scores.grammar;
    if (result.scores.vocabulary !== undefined) rollingUpdates.vocabulary = result.scores.vocabulary;

    await this.db.updateRollingScores(userId, rollingUpdates);

    await this.streaks.recordActivity(userId);
    await this.db.logActivity(userId, 'call_completed', { call_id: callId });

    return this.mapReport(report);
  }

  async addConversationTurn(
    userId: string,
    callId: string,
    role: 'user' | 'assistant',
    content: string,
  ): Promise<void> {
    const call = await this.db.findOne<Record<string, unknown>>(
      'scheduled_calls',
      { id: callId, user_id: userId },
    );
    if (!call) throw new NotFoundException('Call not found');

    const history = (call['conversation_history'] as unknown[]) ?? [];
    history.push({ role, content, timestamp: new Date().toISOString() });

    await this.db.update('scheduled_calls', { id: callId }, {
      conversation_history: history,
      updated_at: new Date().toISOString(),
    });
  }

  async getCallTurns(userId: string, callId: string): Promise<unknown[]> {
    const call = await this.db.findOne<Record<string, unknown>>(
      'scheduled_calls',
      { id: callId, user_id: userId },
    );
    if (!call) throw new NotFoundException('Call not found');

    return (call['conversation_history'] as unknown[]) ?? [];
  }

  async declineCall(userId: string, callId: string): Promise<ScheduledCall> {
    const call = await this.db.findOne<Record<string, unknown>>(
      'scheduled_calls',
      { id: callId, user_id: userId },
    );
    if (!call) throw new NotFoundException('Call not found');
    if (call['status'] !== 'scheduled') {
      throw new BadRequestException(`Call cannot be declined — status is ${call['status'] as string}`);
    }

    const updated = await this.db.update<Record<string, unknown>>(
      'scheduled_calls',
      { id: callId },
      { status: 'declined', updated_at: new Date().toISOString() },
    );

    await this.db.logActivity(userId, 'call_declined', { call_id: callId });
    return this.mapCall(updated);
  }

  async getReport(userId: string, callId: string): Promise<SessionReport> {
    const report = await this.db.findOne<Record<string, unknown>>(
      'session_reports',
      { session_id: callId, user_id: userId },
    );
    if (!report) throw new NotFoundException('Report not found');
    return this.mapReport(report);
  }

  async getScenarios(): Promise<CallScenario[]> {
    const rows = await this.db.findMany<Record<string, unknown>>(
      'call_scenarios',
      { is_active: true },
      '*',
      { orderBy: 'category', ascending: true },
    );
    return rows.map(this.mapScenario);
  }

  // ─── Mappers ───────────────────────────────────────────────────────────────

  private mapCall(row: Record<string, unknown>, scenario?: CallScenario): ScheduledCall {
    return {
      id: row['id'] as string,
      userId: row['user_id'] as string,
      scenarioId: row['scenario_id'] as string,
      scheduledTime: row['scheduled_time'] as string,
      status: row['status'] as ScheduledCall['status'],
      ...(scenario ? { scenario } : {}),
    };
  }

  private mapScenario(row: Record<string, unknown>): CallScenario {
    return {
      id: row['id'] as string,
      title: row['title'] as string,
      category: row['category'] as CallScenario['category'],
      personaName: row['persona_name'] as string,
      personaRole: row['persona_role'] as string,
      promptTemplate: row['prompt_template'] as string,
      difficulty: row['difficulty'] as CallScenario['difficulty'],
    };
  }

  private mapReport(row: Record<string, unknown>): SessionReport {
    return {
      id: row['id'] as string,
      userId: row['user_id'] as string,
      sessionType: row['session_type'] as SessionReport['sessionType'],
      sessionId: row['session_id'] as string | undefined,
      scoreJson: row['score_json'] as SessionReport['scoreJson'],
      feedback: row['feedback'] as string,
      strengths: (row['strengths'] as string[]) ?? [],
      improvements: (row['improvements'] as string[]) ?? [],
      recommendations: (row['recommendations'] as string[]) ?? [],
      createdAt: row['created_at'] as string,
    };
  }
}
