import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CallsService } from '../calls/calls.service';
import { StreaksService } from '../streaks/streaks.service';
import { TopicsService } from '../topics/topics.service';
import type {
  DashboardData,
  UserScores,
  ProgressHistory,
  ProgressRange,
  ProgressDataPoint,
  CommunicationScores,
  SessionReport,
} from '@fluento/shared';

@Injectable()
export class ProgressService {
  constructor(
    private readonly db: DatabaseService,
    private readonly calls: CallsService,
    private readonly streaks: StreaksService,
    private readonly topics: TopicsService,
  ) {}

  async getDashboard(userId: string): Promise<DashboardData> {
    const [scoresRow, streak, upcomingCalls, recentSessions] = await Promise.all([
      this.db.findOne<Record<string, unknown>>('user_scores', { user_id: userId }),
      this.streaks.getStreak(userId),
      this.calls.getUpcoming(userId),
      this.getRecentSessions(userId),
    ]);

    const scores = this.mapScores(scoresRow);
    const upcomingCall = upcomingCalls[0] ?? null;

    // Recommend based on weakest score
    const weakest = this.findWeakestSkill(scores);
    const recommendedChallenge = await this.getRecommendation(weakest);

    return { scores, streak, upcomingCall, recentSessions, recommendedChallenge };
  }

  async getProgressHistory(userId: string, range: ProgressRange): Promise<ProgressHistory> {
    const since = this.getRangeStart(range);

    const { data } = await this.db.client
      .from('score_history')
      .select('fluency, grammar, vocabulary, observation, expressiveness, recorded_at')
      .eq('user_id', userId)
      .gte('recorded_at', since.toISOString())
      .order('recorded_at', { ascending: true });

    const rows = (data ?? []) as Record<string, unknown>[];
    const dataPoints: ProgressDataPoint[] = rows.map((row) => ({
      date: row['recorded_at'] as string,
      scores: {
        fluency: (row['fluency'] as number) ?? 0,
        grammar: (row['grammar'] as number) ?? 0,
        vocabulary: (row['vocabulary'] as number) ?? 0,
        observation: (row['observation'] as number) ?? 0,
        expressiveness: (row['expressiveness'] as number) ?? 0,
      },
    }));

    const personalBests = this.computePersonalBests(dataPoints);

    return { range, dataPoints, personalBests };
  }

  private async getRecentSessions(userId: string): Promise<SessionReport[]> {
    const rows = await this.db.findMany<Record<string, unknown>>(
      'session_reports',
      { user_id: userId },
      '*',
      { orderBy: 'created_at', ascending: false, limit: 10 },
    );
    return rows.map((row) => ({
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
    }));
  }

  private async getRecommendation(weakestSkill: string) {
    try {
      if (weakestSkill === 'observation' || weakestSkill === 'expressiveness') {
        return null; // Image study — returned from image module in Phase 8
      }
      return await this.topics.getRandomExercise();
    } catch {
      return null;
    }
  }

  private findWeakestSkill(scores: UserScores): string {
    const fields: (keyof CommunicationScores)[] = [
      'fluency', 'grammar', 'vocabulary', 'observation', 'expressiveness',
    ];
    return fields.reduce((min, field) =>
      scores[field] < scores[min as keyof CommunicationScores] ? field : min,
    fields[0]!);
  }

  private mapScores(row: Record<string, unknown> | null): UserScores {
    if (!row) {
      return { id: '', userId: '', fluency: 50, grammar: 50, vocabulary: 50, observation: 50, expressiveness: 50, updatedAt: '' };
    }
    return {
      id: row['id'] as string,
      userId: row['user_id'] as string,
      fluency: row['fluency'] as number,
      grammar: row['grammar'] as number,
      vocabulary: row['vocabulary'] as number,
      observation: row['observation'] as number,
      expressiveness: row['expressiveness'] as number,
      updatedAt: row['updated_at'] as string,
    };
  }

  private getRangeStart(range: ProgressRange): Date {
    const now = new Date();
    if (range === 'daily') { now.setDate(now.getDate() - 1); return now; }
    if (range === 'weekly') { now.setDate(now.getDate() - 7); return now; }
    if (range === 'monthly') { now.setMonth(now.getMonth() - 1); return now; }
    now.setFullYear(now.getFullYear() - 5); return now;
  }

  private computePersonalBests(points: ProgressDataPoint[]): CommunicationScores {
    const fields: (keyof CommunicationScores)[] = [
      'fluency', 'grammar', 'vocabulary', 'observation', 'expressiveness',
    ];
    const bests = { fluency: 0, grammar: 0, vocabulary: 0, observation: 0, expressiveness: 0 };
    for (const point of points) {
      for (const field of fields) {
        if (point.scores[field] > bests[field]) bests[field] = point.scores[field];
      }
    }
    return bests;
  }
}
