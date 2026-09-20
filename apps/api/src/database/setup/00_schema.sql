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
  id              uuid        primary key default uuid_generate_v4(),
  user_id         uuid        not null unique references public.users(id) on delete cascade,
  fluency         numeric(5,2) not null default 50,
  grammar         numeric(5,2) not null default 50,
  vocabulary      numeric(5,2) not null default 50,
  observation     numeric(5,2) not null default 50,
  expressiveness  numeric(5,2) not null default 50,
  updated_at      timestamptz  not null default now()
);

-- ─── score_history ───────────────────────────────────────────────────────────
create table if not exists public.score_history (
  id            uuid        primary key default uuid_generate_v4(),
  user_id       uuid        not null references public.users(id) on delete cascade,
  session_type  varchar(30) not null
                  check (session_type in ('voice_call', 'image_study', 'thought_exercise')),
  fluency         numeric(5,2),
  grammar         numeric(5,2),
  vocabulary      numeric(5,2),
  observation     numeric(5,2),
  expressiveness  numeric(5,2),
  recorded_at   timestamptz  not null default now()
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
