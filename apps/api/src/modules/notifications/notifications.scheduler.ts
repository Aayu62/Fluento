import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationsDeliveryService } from './delivery.service';

@Injectable()
export class NotificationsScheduler {
  private readonly logger = new Logger(NotificationsScheduler.name);

  constructor(private readonly delivery: NotificationsDeliveryService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    try {
      const result = await this.delivery.processDueNotifications();
      const missed = await this.delivery.markOverdueMissed();
      this.logger.debug(`Notifications processed: ${JSON.stringify(result)}, missedMarked: ${JSON.stringify(missed)}`);
    } catch (err) {
      this.logger.error('Error processing notifications', err as Error);
    }
  }
}
