import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationsDeliveryService } from './delivery.service';
import { DatabaseService } from '../../database/database.service';
import * as crypto from 'crypto';

@Injectable()
export class NotificationsScheduler {
  private readonly logger = new Logger(NotificationsScheduler.name);

  private readonly instanceId = crypto.randomUUID();

  constructor(
    private readonly delivery: NotificationsDeliveryService,
    private readonly db: DatabaseService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    const lockName = 'notifications_cron';
    // Expire lock after 45 seconds (we run every minute, so this gives enough time before next run)
    const expiresAt = new Date(Date.now() + 45000).toISOString();

    try {
      // Attempt to acquire lock using upsert with a condition that the existing lock is expired.
      // Since supabase JS doesn't support complex ON CONFLICT WHERE, we'll try to delete expired lock first.
      await this.db.client
        .from('cron_locks')
        .delete()
        .eq('lock_name', lockName)
        .lt('expires_at', new Date().toISOString());

      const { data, error } = await this.db.client
        .from('cron_locks')
        .insert({
          lock_name: lockName,
          locked_by: this.instanceId,
          expires_at: expiresAt,
        })
        .select()
        .single();

      if (error || !data) {
        this.logger.debug(`Could not acquire lock for ${lockName}, skipping.`);
        return;
      }

      this.logger.debug(`Acquired lock for ${lockName}. Processing notifications...`);
      const result = await this.delivery.processDueNotifications();
      const missed = await this.delivery.markOverdueMissed();
      this.logger.debug(`Notifications processed: ${JSON.stringify(result)}, missedMarked: ${JSON.stringify(missed)}`);

      // Release the lock
      await this.db.client
        .from('cron_locks')
        .delete()
        .eq('lock_name', lockName)
        .eq('locked_by', this.instanceId);
        
      this.logger.debug(`Released lock for ${lockName}.`);
    } catch (err) {
      this.logger.error('Error processing notifications', err as Error);
    }
  }
}
