-- ============================================================
-- Migration: 003_fix_declined_to_missed
-- Description: Map any historical `declined` scheduled_calls to `missed`.
-- Run in: Supabase SQL Editor
-- Note: This does not change the allowed status values.
-- ============================================================

begin;
update public.scheduled_calls
set status = 'missed', updated_at = now()
where status = 'declined';
commit;
