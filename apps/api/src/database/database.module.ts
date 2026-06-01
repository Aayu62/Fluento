import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { DatabaseService } from './database.service';

export const SUPABASE_CLIENT = 'SUPABASE_CLIENT';

@Global()
@Module({
  providers: [
    {
      provide: SUPABASE_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService): SupabaseClient => {
        const url = config.getOrThrow<string>('SUPABASE_URL');
        const key = config.getOrThrow<string>('SUPABASE_SERVICE_ROLE_KEY');
        return createClient(url, key, {
          auth: { autoRefreshToken: false, persistSession: false },
        });
      },
    },
    DatabaseService,
  ],
  exports: [SUPABASE_CLIENT, DatabaseService],
})
export class DatabaseModule {}
