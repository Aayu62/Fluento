import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationsDeliveryService } from './delivery.service';
import { NotificationsScheduler } from './notifications.scheduler';

@Module({
	controllers: [NotificationsController],
	providers: [NotificationsService, NotificationsDeliveryService, NotificationsScheduler],
	exports: [NotificationsService, NotificationsDeliveryService],
})
export class NotificationsModule {}
