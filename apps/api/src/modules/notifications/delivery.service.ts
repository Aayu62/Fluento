import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class NotificationsDeliveryService {
  private readonly logger = new Logger(NotificationsDeliveryService.name);

  constructor(private readonly db: DatabaseService) {}

  /**
   * Send push notifications for calls scheduled at or before now.
   * Delivery is logged to `activity_log` with retry handling.
   */
  async processDueNotifications(): Promise<{ processed: number; sent: number; missingTokens: number }> {
    const now = new Date().toISOString();
    const calls = await this.db.findMany<Record<string, unknown>>(
      'scheduled_calls',
      { status: 'scheduled' },
      '*',
      { limit: 200, orderBy: 'scheduled_time', ascending: true },
    );

    let processed = 0;
    let sent = 0;
    let missingTokens = 0;

    for (const call of calls) {
      const scheduled = new Date(call['scheduled_time'] as string);
      if (scheduled > new Date(now)) break; // future calls — stop

      processed += 1;
      const userId = call['user_id'] as string;
      const callId = call['id'] as string;

      const tokens = await this.db.findMany<Record<string, unknown>>('push_tokens', { user_id: userId });
      if (tokens.length === 0) {
        missingTokens += 1;
        await this.db.logActivity(userId, 'push_not_sent', { call_id: callId });
        this.logger.warn(`No push tokens for user ${userId} (call ${callId})`);
        continue;
      }

      // Attempt delivery per token with a single retry on failure.
      for (const t of tokens) {
        const token = t['token'] as string;
        try {
          await this.sendPush(userId, callId, token);
          await this.db.logActivity(userId, 'push_sent', { call_id: callId, token });
          sent += 1;
        } catch (err) {
          this.logger.warn(`Initial send failed for token ${token}, retrying...`);
          try {
            await this.sendPush(userId, callId, token);
            await this.db.logActivity(userId, 'push_sent', { call_id: callId, token, retried: true });
            sent += 1;
          } catch (err2) {
            await this.db.logActivity(userId, 'push_failed', { call_id: callId, token, reason: String(err2) });
            this.logger.error(`Failed to send push for ${token}: ${(err2 as Error).message}`);
          }
        }
      }
    }

    return { processed, sent, missingTokens };
  }

  /**
   * Mark scheduled calls that are long overdue as `missed`.
   * Default grace window is 5 minutes.
   */
  async markOverdueMissed(graceMinutes = 5): Promise<{ updated: number }> {
    const cutoff = new Date(Date.now() - graceMinutes * 60_000).toISOString();
    const overdue = await this.db.client
      .from('scheduled_calls')
      .select('*')
      .eq('status', 'scheduled')
      .lt('scheduled_time', cutoff);

    const rows = (overdue.data ?? []) as Record<string, unknown>[];
    let updated = 0;
    for (const row of rows) {
      const userId = row['user_id'] as string;
      const callId = row['id'] as string;
      await this.db.update('scheduled_calls', { id: callId }, { status: 'missed', updated_at: new Date().toISOString() });
      await this.db.logActivity(userId, 'call_missed_auto', { call_id: callId });
      updated += 1;
    }

    return { updated };
  }

  /**
   * Dispatches push message via Expo Server Push API.
   */
  private async sendPush(userId: string, callId: string, token: string): Promise<void> {
    if (process.env.NODE_ENV === 'test' || token.startsWith('mock_')) {
      return;
    }

    try {
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip, deflate',
        },
        body: JSON.stringify({
          to: token,
          sound: 'default',
          title: 'Incoming AI Voice Call',
          body: 'Your AI practice partner is ready. Tap to join your call session.',
          data: { callId, type: 'incoming_call' },
          priority: 'high',
        }),
      });

      if (!response.ok) {
        throw new Error(`Expo push service error status ${response.status}`);
      }
    } catch (err) {
      this.logger.error(`Error dispatching push to Expo for token ${token}`, err as Error);
      throw err;
    }
  }
}
