-- Description: Create a table for distributed cron locks to ensure only one instance processes notifications at a time.
-- Run in: Supabase SQL Editor (after 004)
-- ============================================================

create table if not exists public.cron_locks (
  lock_name      varchar(100) primary key,
  locked_by      varchar(100) not null,
  locked_at      timestamptz  not null default now(),
  expires_at     timestamptz  not null
);

-- Note: No RLS is applied as this is only accessed by the server via service role key.
