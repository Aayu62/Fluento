import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  InternalServerErrorException,
  Inject,
  Logger,
} from '@nestjs/common';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';
import { SUPABASE_CLIENT } from '../../database/database.module';
import { UsersService } from '../users/users.service';
import type { RegisterDto, LoginDto } from '@fluento/shared';

export interface AuthTokenResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    fullName: string;
  };
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  private readonly anonClient: SupabaseClient;

  constructor(
    @Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient,
    private readonly config: ConfigService,
    private readonly usersService: UsersService,
  ) {
    this.anonClient = createClient(
      this.config.getOrThrow<string>('SUPABASE_URL'),
      this.config.getOrThrow<string>('SUPABASE_ANON_KEY'),
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
  }

  async register(dto: RegisterDto): Promise<AuthTokenResponse> {
    const { data, error } = await this.supabase.auth.admin.createUser({
      email: dto.email,
      password: dto.password,
      email_confirm: true,
      user_metadata: { full_name: dto.fullName },
    });

    if (error) {
      if (error.message.toLowerCase().includes('already registered')) {
        throw new ConflictException('An account with this email already exists');
      }
      this.logger.error('Registration failed', error.message);
      throw new InternalServerErrorException('Registration failed');
    }

    if (!data.user) {
      throw new InternalServerErrorException('User creation failed');
    }

    await this.usersService.upsert({
      id: data.user.id,
      email: dto.email,
      fullName: dto.fullName,
    });

    // Sign in immediately to get tokens
    const { data: session, error: signInError } = await this.anonClient.auth.signInWithPassword({
      email: dto.email,
      password: dto.password,
    });

    if (signInError || !session.session) {
      throw new InternalServerErrorException('Account created but sign-in failed');
    }

    return {
      accessToken: session.session.access_token,
      refreshToken: session.session.refresh_token,
      user: {
        id: data.user.id,
        email: dto.email,
        fullName: dto.fullName,
      },
    };
  }

  async login(dto: LoginDto): Promise<AuthTokenResponse> {
    const { data, error } = await this.anonClient.auth.signInWithPassword({
      email: dto.email,
      password: dto.password,
    });

    if (error || !data.session || !data.user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const user = await this.usersService.upsert({
      id: data.user.id,
      email: data.user.email ?? dto.email,
      fullName: (data.user.user_metadata['full_name'] as string | undefined) ?? '',
    });

    return {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
    };
  }

  async refreshToken(refreshToken: string): Promise<AuthTokenResponse> {
    const { data, error } = await this.anonClient.auth.refreshSession({ refresh_token: refreshToken });

    if (error || !data.session || !data.user) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.usersService.findById(data.user.id);
    if (!user) throw new UnauthorizedException('User not found');

    return {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      user: { id: user.id, email: user.email, fullName: user.fullName },
    };
  }

  async logout(accessToken: string): Promise<void> {
    await this.supabase.auth.admin.signOut(accessToken);
  }

  async forgotPassword(email: string): Promise<{ success: boolean }> {
    const { error } = await this.anonClient.auth.resetPasswordForEmail(email, {
      redirectTo: 'http://localhost:3000/reset-password',
    });
    if (error) {
      this.logger.error('Forgot password failed', error.message);
      throw new InternalServerErrorException('Failed to send reset email');
    }
    return { success: true };
  }

  async syncOAuthUser(accessToken: string): Promise<{ success: boolean; user: any }> {
    const { data, error } = await this.anonClient.auth.getUser(accessToken);
    if (error || !data.user) {
      throw new UnauthorizedException('Invalid access token');
    }

    const email = data.user.email;
    const fullName = (data.user.user_metadata['full_name'] as string | undefined) ?? data.user.user_metadata['name'] ?? 'User';

    if (!email) {
      throw new UnauthorizedException('OAuth provider did not return an email');
    }

    const user = await this.usersService.upsert({
      id: data.user.id,
      email,
      fullName,
    });

    return { success: true, user };
  }
}
