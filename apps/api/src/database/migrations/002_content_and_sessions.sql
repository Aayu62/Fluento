-- ============================================================
-- Migration: 002_content_and_sessions
-- Description: call_scenarios, scheduled_calls, session_reports,
--              images, topics, activity_log, push_tokens
-- Run in: Supabase SQL Editor (after 001)
-- ============================================================

-- ─── call_scenarios ──────────────────────────────────────────────────────────
-- TDD §5.6 — content managed by admin
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
-- TDD §5.7 — user-scheduled AI voice call sessions
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
-- TDD §5.8 — AI-generated feedback after each session
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
-- TDD §5.4 — images with AI-generated metadata
create table if not exists public.images (
  id          uuid        primary key default uuid_generate_v4(),
  image_url   text        not null,
  difficulty  varchar(20) not null default 'intermediate'
                check (difficulty in ('beginner', 'intermediate', 'advanced')),
  metadata    jsonb       not null default '{}',
  is_active   boolean     not null default true,
  created_at  timestamptz not null default now()
);

-- ─── topics ──────────────────────────────────────────────────────────────────
-- TDD §5.5 — speaking topics for thought exercises
create table if not exists public.topics (
  id          uuid        primary key default uuid_generate_v4(),
  title       varchar(255) not null,
  category    varchar(30)  not null
                check (category in ('personal', 'professional', 'opinion', 'general')),
  difficulty  varchar(20)  not null default 'intermediate'
                check (difficulty in ('beginner', 'intermediate', 'advanced')),
  prompt      text         not null,
  is_active   boolean      not null default true,
  created_at  timestamptz  not null default now()
);

-- ─── activity_log ────────────────────────────────────────────────────────────
-- FSD §15 — audit trail for key user events
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
-- TDD §16 — Expo push notification tokens per device
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

-- ─── Row Level Security ───────────────────────────────────────────────────────
-- call_scenarios and images and topics are public read (no RLS restriction for SELECT)
alter table public.call_scenarios   enable row level security;
alter table public.scheduled_calls  enable row level security;
alter table public.session_reports  enable row level security;
alter table public.images           enable row level security;
alter table public.topics           enable row level security;
alter table public.activity_log     enable row level security;
alter table public.push_tokens      enable row level security;

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
