import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import type { User } from '@supabase/supabase-js';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ user?: User }>();
    const user = request.user;
    if (!user) throw new ForbiddenException('Admin access required');

    const email = user.email ?? '';
    const userMeta = (user.user_metadata ?? {}) as Record<string, unknown>;

    const isAdminMeta =
      (userMeta['role'] as string | undefined) === 'admin' || userMeta['is_admin'] === true;

    const envAdmins = (process.env.ADMIN_EMAILS ?? '').split(',').map((s) => s.trim()).filter(Boolean);

    if (isAdminMeta) return true;
    if (email && envAdmins.includes(email)) return true;

    throw new ForbiddenException('Admin access required');
  }
}
