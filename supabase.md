# Supabase Database Recovery Guide

This guide outlines the steps to recover your Supabase database from a completely broken state, or to start entirely fresh.

## Step 1: Wipe the Existing Schema

> [!WARNING]
> This is a destructive operation. All your application data and schemas will be permanently deleted. Do this only when you want to start completely fresh.

Go to your Supabase project dashboard -> **SQL Editor** -> **New query**.
Copy, paste, and run the following script to wipe the existing schema and recreate an empty `public` schema with the standard permissions.

```sql
-- Drop the existing public schema and everything inside it
drop schema public cascade;

-- Recreate an empty public schema
create schema public;

-- Restore standard Supabase roles and permissions
grant all on schema public to postgres;
grant all on schema public to public;
grant usage on schema public to anon, authenticated, service_role;
grant all on all tables in schema public to postgres, anon, authenticated, service_role;
grant all on all routines in schema public to postgres, anon, authenticated, service_role;
grant all on all sequences in schema public to postgres, anon, authenticated, service_role;

alter default privileges in schema public grant all on tables to postgres, anon, authenticated, service_role;
alter default privileges in schema public grant all on routines to postgres, anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to postgres, anon, authenticated, service_role;
```

## Step 2: Apply the Consolidated Schema

Once the schema is wiped, you need to recreate all tables, indexes, and row-level security (RLS) policies.

1. In the Supabase **SQL Editor**, create a **New query**.
2. Open `apps/api/src/database/setup/00_schema.sql` from your code editor.
3. Copy its entire contents and paste it into the Supabase SQL Editor.
4. Click **Run**.

## Step 3: Insert Initial Seed Data

Finally, you need to populate the database with initial application data (like call scenarios and thought exercise topics).

1. Create another **New query** in the Supabase SQL Editor.
2. Open `apps/api/src/database/setup/01_seed.sql` from your code editor.
3. Copy its entire contents and paste it into the Supabase SQL Editor.
4. Click **Run**.

## Success
Your database is now fully reset to its initial development state. You can restart the application, sign up as a new user, and continue development.
