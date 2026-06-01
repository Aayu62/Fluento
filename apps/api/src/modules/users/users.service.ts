import {
  Injectable,
  Inject,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../../database/database.module';
import type { User, UserProfile, OnboardingDto } from '@fluento/shared';

interface UpsertUserInput {
  id: string;
  email: string;
  fullName: string;
}

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(@Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient) {}

  async upsert(input: UpsertUserInput): Promise<User> {
    const now = new Date().toISOString();

    const { data, error } = await this.supabase
      .from('users')
      .upsert(
        {
          id: input.id,
          email: input.email,
          full_name: input.fullName,
          updated_at: now,
        },
        { onConflict: 'id', ignoreDuplicates: false },
      )
      .select('id, email, full_name, created_at, updated_at')
      .single();

    if (error) {
      this.logger.error('Failed to upsert user', error.message);
      throw new InternalServerErrorException('Failed to save user record');
    }

    return this.mapRow(data);
  }

  async findById(id: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from('users')
      .select('id, email, full_name, created_at, updated_at')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      this.logger.error('Failed to find user', error.message);
      throw new InternalServerErrorException('Failed to fetch user');
    }

    return data ? this.mapRow(data) : null;
  }

  async getProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await this.supabase
      .from('user_profiles')
      .select('user_id, goals, skill_level, onboarding_completed')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      this.logger.error('Failed to get profile', error.message);
      throw new InternalServerErrorException('Failed to fetch profile');
    }

    if (!data) return null;

    return {
      userId: data.user_id as string,
      goals: data.goals as UserProfile['goals'],
      skillLevel: data.skill_level as UserProfile['skillLevel'],
      onboardingCompleted: data.onboarding_completed as boolean,
    };
  }

  async completeOnboarding(userId: string, dto: OnboardingDto): Promise<UserProfile> {
    const { data, error } = await this.supabase
      .from('user_profiles')
      .upsert(
        {
          user_id: userId,
          goals: dto.goals,
          skill_level: dto.skillLevel,
          onboarding_completed: true,
        },
        { onConflict: 'user_id' },
      )
      .select('user_id, goals, skill_level, onboarding_completed')
      .single();

    if (error) {
      this.logger.error('Failed to save onboarding', error.message);
      throw new InternalServerErrorException('Failed to save onboarding data');
    }

    // Initialize scores at 50/100 baseline (FSD §4)
    await this.supabase.from('user_scores').upsert(
      {
        user_id: userId,
        fluency: 50,
        grammar: 50,
        vocabulary: 50,
        observation: 50,
        expressiveness: 50,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id', ignoreDuplicates: true },
    );

    // Initialize streak record
    await this.supabase.from('user_streaks').upsert(
      {
        user_id: userId,
        current_streak: 0,
        best_streak: 0,
        last_activity_date: null,
      },
      { onConflict: 'user_id', ignoreDuplicates: true },
    );

    return {
      userId: data.user_id as string,
      goals: data.goals as UserProfile['goals'],
      skillLevel: data.skill_level as UserProfile['skillLevel'],
      onboardingCompleted: data.onboarding_completed as boolean,
    };
  }

  async getMe(userId: string): Promise<{ user: User; profile: UserProfile | null }> {
    const user = await this.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    const profile = await this.getProfile(userId);
    return { user, profile };
  }

  private mapRow(row: Record<string, unknown>): User {
    return {
      id: row['id'] as string,
      email: row['email'] as string,
      fullName: row['full_name'] as string,
      createdAt: row['created_at'] as string,
      updatedAt: row['updated_at'] as string,
    };
  }
}
