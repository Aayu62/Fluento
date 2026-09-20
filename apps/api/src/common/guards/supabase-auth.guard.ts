import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../../database/database.module';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(@Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      headers: Record<string, string | undefined>;
      cookies?: Record<string, string | undefined>;
      user?: unknown;
    }>();

    let token = '';
    const authHeader = request.headers['authorization'];
    
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    } else if (request.cookies?.['fluento_token']) {
      token = request.cookies['fluento_token'];
    }

    if (!token) {
      throw new UnauthorizedException('Missing authorization token');
    }

    const { data, error } = await this.supabase.auth.getUser(token);

    if (error ?? !data.user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    request.user = data.user;
    return true;
  }
}
