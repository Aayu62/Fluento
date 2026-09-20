-- ============================================================
-- File: 00_schema.sql
-- Description: Complete consolidated database schema
-- Run in: Supabase SQL Editor
-- ============================================================

-- ─── Enable UUID extension ────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── users ───────────────────────────────────────────────────────────────────
create table if not exists public.users (
  id          uuid        primary key,
  email       varchar(255) not null unique,
  full_name   varchar(255) not null default '',
  created_at  timestamptz  not null default now(),
  updated_at  timestamptz  not null default now()
);

-- ─── user_profiles ───────────────────────────────────────────────────────────
create table if not exists public.user_profiles (
  user_id               uuid        primary key references public.users(id) on delete cascade,
  goals                 text[]      not null default '{}',
  skill_level           varchar(20) not null default 'beginner'
                          check (skill_level in ('beginner', 'intermediate', 'advanced')),
  onboarding_completed  boolean     not null default false,
  notification_prefs    jsonb       not null default '{"pushEnabled": true, "emailEnabled": false}'
);

-- ─── user_scores ─────────────────────────────────────────────────────────────
create table if not exists public.user_scores (
  id                uuid         primary key default uuid_generate_v4(),
  user_id           uuid         not null unique references public.users(id) on delete cascade,
  -- Shared
  fluency           numeric(5,2) not null default 50,
  grammar           numeric(5,2) not null default 50,
  vocabulary        numeric(5,2) not null default 50,
  -- Voice call
  confidence        numeric(5,2) not null default 50,
  -- Image study
  observation       numeric(5,2) not null default 50,
  expressiveness    numeric(5,2) not null default 50,
  -- Thought exercise
  clarity           numeric(5,2) not null default 50,
  argument_strength numeric(5,2) not null default 50,
  updated_at        timestamptz  not null default now()
);

-- ─── score_history ───────────────────────────────────────────────────────────
create table if not exists public.score_history (
  id                uuid         primary key default uuid_generate_v4(),
  user_id           uuid         not null references public.users(id) on delete cascade,
  session_type      varchar(30)  not null
                      check (session_type in ('voice_call', 'image_study', 'thought_exercise')),
  fluency           numeric(5,2),
  grammar           numeric(5,2),
  vocabulary        numeric(5,2),
  confidence        numeric(5,2),
  observation       numeric(5,2),
  expressiveness    numeric(5,2),
  clarity           numeric(5,2),
  argument_strength numeric(5,2),
  recorded_at       timestamptz  not null default now()
);

create index if not exists idx_score_history_user_date
  on public.score_history(user_id, recorded_at desc);

-- ─── user_streaks ─────────────────────────────────────────────────────────────
create table if not exists public.user_streaks (
  user_id             uuid    primary key references public.users(id) on delete cascade,
  current_streak      integer not null default 0,
  best_streak         integer not null default 0,
  last_activity_date  date
);

-- ─── call_scenarios ──────────────────────────────────────────────────────────
create table if not exists public.call_scenarios (
  id               uuid        primary key default uuid_generate_v4(),
  title            varchar(255) not null,
  category         varchar(30)  not null
                     check (category in ('interview', 'sales', 'daily_conversation')),
  persona_name     varchar(100) not null,
  persona_role     varchar(100) not null,
  prompt_template  text         not null,
  difficulty       varchar(20)  not null default 'intermediate'
                     check (difficulty in ('beginner', 'intermediate', 'advanced')),
  is_active        boolean      not null default true,
  created_at       timestamptz  not null default now()
);

-- ─── scheduled_calls ─────────────────────────────────────────────────────────
create table if not exists public.scheduled_calls (
  id                   uuid        primary key default uuid_generate_v4(),
  user_id              uuid        not null references public.users(id) on delete cascade,
  scenario_id          uuid        not null references public.call_scenarios(id) on delete restrict,
  scheduled_time       timestamptz not null,
  status               varchar(20) not null default 'scheduled'
                         check (status in ('scheduled', 'active', 'completed', 'missed', 'cancelled')),
  conversation_history jsonb       not null default '[]',
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index if not exists idx_scheduled_calls_user_time
  on public.scheduled_calls(user_id, scheduled_time);

create index if not exists idx_scheduled_calls_status_time
  on public.scheduled_calls(status, scheduled_time)
  where status = 'scheduled';

-- ─── session_reports ─────────────────────────────────────────────────────────
create table if not exists public.session_reports (
  id            uuid        primary key default uuid_generate_v4(),
  user_id       uuid        not null references public.users(id) on delete cascade,
  session_type  varchar(30) not null
                  check (session_type in ('voice_call', 'image_study', 'thought_exercise')),
  session_id    uuid,
  score_json    jsonb       not null default '{}',
  feedback      text        not null default '',
  strengths     text[]      not null default '{}',
  improvements  text[]      not null default '{}',
  recommendations text[]    not null default '{}',
  created_at    timestamptz not null default now()
);

create index if not exists idx_session_reports_user_date
  on public.session_reports(user_id, created_at desc);

-- ─── images ──────────────────────────────────────────────────────────────────
create table if not exists public.images (
  id          uuid        primary key default uuid_generate_v4(),
  image_url   text        not null,
  difficulty  varchar(20) not null default 'intermediate'
                check (difficulty in ('beginner', 'intermediate', 'advanced')),
  metadata    jsonb       not null default '{}',
  is_active   boolean     not null default true,
  created_at  timestamptz not null default now()
);

-- ─── topics (V2) ─────────────────────────────────────────────────────────────
create table if not exists public.topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('personal', 'professional', 'opinion', 'general', 'technology', 'current_affairs', 'history', 'miscellaneous')),
    difficulty VARCHAR(50) NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    prompt TEXT NOT NULL,
    format VARCHAR(50) NOT NULL CHECK (format IN ('monologue', 'debate')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ─── activity_log ────────────────────────────────────────────────────────────
create table if not exists public.activity_log (
  id          uuid        primary key default uuid_generate_v4(),
  user_id     uuid        not null references public.users(id) on delete cascade,
  event_type  varchar(50) not null,
  metadata    jsonb       not null default '{}',
  created_at  timestamptz not null default now()
);

create index if not exists idx_activity_log_user_date
  on public.activity_log(user_id, created_at desc);

-- ─── push_tokens ─────────────────────────────────────────────────────────────
create table if not exists public.push_tokens (
  id          uuid        primary key default uuid_generate_v4(),
  user_id     uuid        not null references public.users(id) on delete cascade,
  token       text        not null unique,
  platform    varchar(10) not null
                check (platform in ('ios', 'android', 'web')),
  created_at  timestamptz not null default now()
);

create index if not exists idx_push_tokens_user
  on public.push_tokens(user_id);

-- ─── cron_locks ──────────────────────────────────────────────────────────────
create table if not exists public.cron_locks (
  lock_name      varchar(100) primary key,
  locked_by      varchar(100) not null,
  locked_at      timestamptz  not null default now(),
  expires_at     timestamptz  not null
);

-- ─── Row Level Security ───────────────────────────────────────────────────────
alter table public.users          enable row level security;
alter table public.user_profiles  enable row level security;
alter table public.user_scores    enable row level security;
alter table public.score_history  enable row level security;
alter table public.user_streaks   enable row level security;
alter table public.call_scenarios enable row level security;
alter table public.scheduled_calls enable row level security;
alter table public.session_reports enable row level security;
alter table public.images         enable row level security;
alter table public.topics         enable row level security;
alter table public.activity_log   enable row level security;
alter table public.push_tokens    enable row level security;
alter table public.cron_locks     enable row level security;

-- Users can only read/update their own row
create policy "users: own row" on public.users
  for all using (auth.uid() = id);

create policy "user_profiles: own row" on public.user_profiles
  for all using (auth.uid() = user_id);

create policy "user_scores: own row" on public.user_scores
  for all using (auth.uid() = user_id);

create policy "score_history: own rows" on public.score_history
  for all using (auth.uid() = user_id);

create policy "user_streaks: own row" on public.user_streaks
  for all using (auth.uid() = user_id);

-- Content tables: anyone authenticated can read, only service role can write
create policy "call_scenarios: authenticated read" on public.call_scenarios
  for select using (auth.role() = 'authenticated');

create policy "images: authenticated read" on public.images
  for select using (auth.role() = 'authenticated');

create policy "topics: authenticated read" on public.topics
  for select using (auth.role() = 'authenticated');

-- User-owned tables
create policy "scheduled_calls: own rows" on public.scheduled_calls
  for all using (auth.uid() = user_id);

create policy "session_reports: own rows" on public.session_reports
  for all using (auth.uid() = user_id);

create policy "activity_log: own rows" on public.activity_log
  for all using (auth.uid() = user_id);

create policy "push_tokens: own rows" on public.push_tokens
  for all using (auth.uid() = user_id);

-- ─── submit_session_tx (RPC) ──────────────────────────────────────────────────
-- Atomically saves a session report, updates rolling user scores (weighted
-- 80/20 rolling average), appends a score_history row, and logs the activity.
-- Uses explicit column updates — no dynamic SQL — to prevent column-not-found errors.
create or replace function public.submit_session_tx(
  p_user_id             uuid,
  p_session_type        text,
  p_session_id          uuid,
  p_score_json          jsonb,
  p_feedback            text,
  p_strengths           text[],
  p_improvements        text[],
  p_recommendations     text[],
  p_score_updates       jsonb,
  p_activity_event_type text,
  p_activity_metadata   jsonb,
  p_score_history_entry jsonb default null
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_report_id uuid;
begin
  -- 1. Insert session report
  insert into public.session_reports
    (user_id, session_type, session_id, score_json, feedback, strengths, improvements, recommendations)
  values
    (p_user_id, p_session_type, p_session_id, p_score_json,
     p_feedback, p_strengths, p_improvements, p_recommendations)
  returning id into v_report_id;

  -- 2. Ensure user_scores row exists
  insert into public.user_scores (user_id)
  values (p_user_id)
  on conflict (user_id) do nothing;

  -- 3. Rolling average update: new = old * 0.8 + new * 0.2
  -- Only updates columns that are present in p_score_updates (safe explicit checks)
  update public.user_scores set
    fluency           = case when p_score_updates ? 'fluency'           then fluency           * 0.8 + (p_score_updates->>'fluency')::numeric           * 0.2 else fluency           end,
    grammar           = case when p_score_updates ? 'grammar'           then grammar           * 0.8 + (p_score_updates->>'grammar')::numeric           * 0.2 else grammar           end,
    vocabulary        = case when p_score_updates ? 'vocabulary'        then vocabulary        * 0.8 + (p_score_updates->>'vocabulary')::numeric        * 0.2 else vocabulary        end,
    confidence        = case when p_score_updates ? 'confidence'        then confidence        * 0.8 + (p_score_updates->>'confidence')::numeric        * 0.2 else confidence        end,
    observation       = case when p_score_updates ? 'observation'       then observation       * 0.8 + (p_score_updates->>'observation')::numeric       * 0.2 else observation       end,
    expressiveness    = case when p_score_updates ? 'expressiveness'    then expressiveness    * 0.8 + (p_score_updates->>'expressiveness')::numeric    * 0.2 else expressiveness    end,
    clarity           = case when p_score_updates ? 'clarity'           then clarity           * 0.8 + (p_score_updates->>'clarity')::numeric           * 0.2 else clarity           end,
    argument_strength = case when p_score_updates ? 'argument_strength' then argument_strength * 0.8 + (p_score_updates->>'argument_strength')::numeric * 0.2 else argument_strength end,
    updated_at        = now()
  where user_id = p_user_id;

  -- 4. Append score_history snapshot (nullable columns — only inserts what was provided)
  if p_score_history_entry is not null then
    insert into public.score_history
      (user_id, session_type, fluency, grammar, vocabulary,
       confidence, observation, expressiveness, clarity, argument_strength)
    values (
      p_user_id,
      p_session_type,
      (p_score_history_entry->>'fluency')::numeric,
      (p_score_history_entry->>'grammar')::numeric,
      (p_score_history_entry->>'vocabulary')::numeric,
      (p_score_history_entry->>'confidence')::numeric,
      (p_score_history_entry->>'observation')::numeric,
      (p_score_history_entry->>'expressiveness')::numeric,
      (p_score_history_entry->>'clarity')::numeric,
      (p_score_history_entry->>'argument_strength')::numeric
    );
  end if;

  -- 5. Write activity log
  insert into public.activity_log (user_id, event_type, metadata)
  values (p_user_id, p_activity_event_type, p_activity_metadata);

  -- 6. Return the created report row as JSON
  return (
    select row_to_json(r)::jsonb
    from (select * from public.session_reports where id = v_report_id) r
  );
end;
$$;


