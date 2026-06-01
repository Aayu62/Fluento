-- ============================================================
-- Migration: 001_auth_and_users
-- Description: Users, profiles, scores, streaks
-- Run in: Supabase SQL Editor
-- ============================================================

-- ─── Enable UUID extension ────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── users ───────────────────────────────────────────────────────────────────
-- Mirrors Supabase auth.users but stores app-level fields.
-- id is the same UUID as auth.users.id (no FK to avoid cross-schema issues).
create table if not exists public.users (
  id          uuid        primary key,
  email       varchar(255) not null unique,
  full_name   varchar(255) not null default '',
  created_at  timestamptz  not null default now(),
  updated_at  timestamptz  not null default now()
);

-- ─── user_profiles ───────────────────────────────────────────────────────────
-- Onboarding data: goals and skill level (FSD §4)
create table if not exists public.user_profiles (
  user_id               uuid        primary key references public.users(id) on delete cascade,
  goals                 text[]      not null default '{}',
  skill_level           varchar(20) not null default 'beginner'
                          check (skill_level in ('beginner', 'intermediate', 'advanced')),
  onboarding_completed  boolean     not null default false
);

-- ─── user_scores ─────────────────────────────────────────────────────────────
-- Current rolling-average communication scores (TDD §5.2)
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
-- Per-session score snapshots for trend charts (identified as missing in Phase 1 review)
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
-- Streak tracking (TDD §5.3)
create table if not exists public.user_streaks (
  user_id             uuid    primary key references public.users(id) on delete cascade,
  current_streak      integer not null default 0,
  best_streak         integer not null default 0,
  last_activity_date  date
);

-- ─── Row Level Security ───────────────────────────────────────────────────────
alter table public.users          enable row level security;
alter table public.user_profiles  enable row level security;
alter table public.user_scores    enable row level security;
alter table public.score_history  enable row level security;
alter table public.user_streaks   enable row level security;

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

-- Service role bypasses RLS (used by NestJS backend)
-- This is automatic for service_role key in Supabase.
