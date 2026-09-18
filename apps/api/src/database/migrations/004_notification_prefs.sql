alter table public.user_profiles 
add column if not exists notification_prefs jsonb not null default '{"pushEnabled": true, "emailEnabled": false}';
