import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import type { UserStreak } from '@fluento/shared';

@Injectable()
export class StreaksService {
  private readonly logger = new Logger(StreaksService.name);

  constructor(private readonly db: DatabaseService) {}

  async getStreak(userId: string): Promise<UserStreak> {
    const row = await this.db.findOne<Record<string, unknown>>(
      'user_streaks',
      { user_id: userId },
    );

    if (!row) {
      return { userId, currentStreak: 0, bestStreak: 0, lastActivityDate: null };
    }

    return this.mapRow(row);
  }

  async getStreakCalendar(
    userId: string,
    year: number,
    month: number,
  ): Promise<{ activeDates: string[] }> {
    const startDate = new Date(year, month - 1, 1).toISOString();
    const endDate = new Date(year, month, 0, 23, 59, 59).toISOString();

    const { data } = await this.db.client
      .from('session_reports')
      .select('created_at')
      .eq('user_id', userId)
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    const activeSet = new Set<string>();
    for (const row of data ?? []) {
      const dateStr = (row.created_at as string).split('T')[0];
      if (dateStr) activeSet.add(dateStr);
    }

    return { activeDates: Array.from(activeSet) };
  }

  // Called after any completed session (FSD §10)
  async recordActivity(userId: string): Promise<UserStreak> {
    const today = new Date().toISOString().split('T')[0]!;

    const existing = await this.db.findOne<Record<string, unknown>>(
      'user_streaks',
      { user_id: userId },
    );

    if (!existing) {
      const created = await this.db.upsert<Record<string, unknown>>(
        'user_streaks',
        { user_id: userId, current_streak: 1, best_streak: 1, last_activity_date: today },
        'user_id',
      );
      return this.mapRow(created);
    }

    const lastDate = existing['last_activity_date'] as string | null;

    // Already recorded today — no change
    if (lastDate === today) return this.mapRow(existing);

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0]!;

    const currentStreak = lastDate === yesterdayStr
      ? (existing['current_streak'] as number) + 1
      : 1;

    const bestStreak = Math.max(
      currentStreak,
      existing['best_streak'] as number,
    );

    const updated = await this.db.upsert<Record<string, unknown>>(
      'user_streaks',
      { user_id: userId, current_streak: currentStreak, best_streak: bestStreak, last_activity_date: today },
      'user_id',
    );

    return this.mapRow(updated);
  }

  private mapRow(row: Record<string, unknown>): UserStreak {
    return {
      userId: row['user_id'] as string,
      currentStreak: row['current_streak'] as number,
      bestStreak: row['best_streak'] as number,
      lastActivityDate: (row['last_activity_date'] as string | null) ?? null,
    };
  }
}
