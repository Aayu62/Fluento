import { Injectable, Inject, InternalServerErrorException, Logger } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from './database.module';

export type TableName =
  | 'users'
  | 'user_profiles'
  | 'user_scores'
  | 'score_history'
  | 'user_streaks'
  | 'call_scenarios'
  | 'scheduled_calls'
  | 'session_reports'
  | 'images'
  | 'topics'
  | 'activity_log'
  | 'push_tokens';

@Injectable()
export class DatabaseService {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(@Inject(SUPABASE_CLIENT) readonly client: SupabaseClient) {}

  // ─── Generic select ────────────────────────────────────────────────────────

  async findOne<T extends Record<string, unknown>>(
    table: TableName,
    match: Partial<Record<string, unknown>>,
    columns = '*',
  ): Promise<T | null> {
    let query = this.client.from(table).select(columns);
    for (const [key, value] of Object.entries(match)) {
      query = query.eq(key, value as string);
    }
    const { data, error } = await query.maybeSingle();
    if (error) this.throw(table, 'findOne', error.message);
    return data as unknown as T | null;
  }

  async findMany<T extends Record<string, unknown>>(
    table: TableName,
    match: Partial<Record<string, unknown>> = {},
    columns = '*',
    options: { limit?: number; orderBy?: string; ascending?: boolean } = {},
  ): Promise<T[]> {
    let query = this.client.from(table).select(columns);
    for (const [key, value] of Object.entries(match)) {
      query = query.eq(key, value as string);
    }
    if (options.orderBy) {
      query = query.order(options.orderBy, { ascending: options.ascending ?? false });
    }
    if (options.limit) {
      query = query.limit(options.limit);
    }
    const { data, error } = await query;
    if (error) this.throw(table, 'findMany', error.message);
    return (data ?? []) as unknown as T[];
  }

  // ─── Generic insert ────────────────────────────────────────────────────────

  async insert<T extends Record<string, unknown>>(
    table: TableName,
    row: Record<string, unknown>,
    columns = '*',
  ): Promise<T> {
    const { data, error } = await this.client
      .from(table)
      .insert(row)
      .select(columns)
      .single();
    if (error) this.throw(table, 'insert', error.message);
    return data as unknown as T;
  }

  // ─── Generic upsert ────────────────────────────────────────────────────────

  async upsert<T extends Record<string, unknown>>(
    table: TableName,
    row: Record<string, unknown>,
    onConflict: string,
    columns = '*',
  ): Promise<T> {
    const { data, error } = await this.client
      .from(table)
      .upsert(row, { onConflict })
      .select(columns)
      .single();
    if (error) this.throw(table, 'upsert', error.message);
    return data as unknown as T;
  }

  // ─── Generic update ────────────────────────────────────────────────────────

  async update<T extends Record<string, unknown>>(
    table: TableName,
    match: Partial<Record<string, unknown>>,
    values: Record<string, unknown>,
    columns = '*',
  ): Promise<T> {
    let query = this.client.from(table).update(values).select(columns);
    for (const [key, value] of Object.entries(match)) {
      query = query.eq(key, value as string);
    }
    const { data, error } = await query.single();
    if (error) this.throw(table, 'update', error.message);
    return data as unknown as T;
  }

  // ─── Generic delete ────────────────────────────────────────────────────────

  async delete(
    table: TableName,
    match: Partial<Record<string, unknown>>,
  ): Promise<void> {
    let query = this.client.from(table).delete();
    for (const [key, value] of Object.entries(match)) {
      query = query.eq(key, value as string);
    }
    const { error } = await query;
    if (error) this.throw(table, 'delete', error.message);
  }

  // ─── Activity log helper ───────────────────────────────────────────────────

  async logActivity(
    userId: string,
    eventType: string,
    metadata: Record<string, unknown> = {},
  ): Promise<void> {
    const { error } = await this.client.from('activity_log').insert({
      user_id: userId,
      event_type: eventType,
      metadata,
    });
    if (error) {
      // Non-fatal — log but don't throw
      this.logger.warn(`Failed to log activity [${eventType}]: ${error.message}`);
    }
  }

  // ─── Score update helper ───────────────────────────────────────────────────
  // TDD §15 — weighted rolling average: new = old * 0.8 + session * 0.2

  async updateRollingScores(
    userId: string,
    sessionScores: Partial<Record<'fluency' | 'grammar' | 'vocabulary' | 'observation' | 'expressiveness', number>>,
  ): Promise<void> {
    const current = await this.findOne<Record<string, number>>(
      'user_scores',
      { user_id: userId },
      'fluency, grammar, vocabulary, observation, expressiveness',
    );

    if (!current) return;

    const updated: Record<string, number> = {};
    const fields = ['fluency', 'grammar', 'vocabulary', 'observation', 'expressiveness'] as const;

    for (const field of fields) {
      const sessionVal = sessionScores[field];
      if (sessionVal !== undefined) {
        const oldVal = current[field] ?? 50;
        updated[field] = Math.round((oldVal * 0.8 + sessionVal * 0.2) * 100) / 100;
      }
    }

    if (Object.keys(updated).length === 0) return;

    await this.client
      .from('user_scores')
      .update({ ...updated, updated_at: new Date().toISOString() })
      .eq('user_id', userId);
  }

  // ─── Error helper ──────────────────────────────────────────────────────────

  private throw(table: string, operation: string, message: string): never {
    this.logger.error(`DB error [${table}.${operation}]: ${message}`);
    throw new InternalServerErrorException(`Database operation failed`);
  }
}
