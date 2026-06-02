import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import type { PushToken } from '@fluento/shared';

@Injectable()
export class NotificationsService {
  constructor(private readonly db: DatabaseService) {}

  async registerPushToken(userId: string, token: string, platform: 'ios' | 'android' | 'web'):
    Promise<PushToken> {
    const row = await this.db.upsert<Record<string, unknown>>(
      'push_tokens',
      { user_id: userId, token, platform },
      'token',
    );

    return {
      id: row['id'] as string,
      userId: row['user_id'] as string,
      token: row['token'] as string,
      platform: row['platform'] as 'ios' | 'android' | 'web',
      createdAt: row['created_at'] as string,
    };
  }
}
