-- pitchNpivot — notifications migration
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor → New query).
--
-- notification_log already exists (user_id, type, read, created_at, payload)
-- but was never populated by v1 — no insert path was found anywhere in its
-- code, so its RLS policies (if any) were never actually exercised for
-- writes. Notifications are inherently "someone else's action, about me",
-- so the insert has to be allowed for a user_id that isn't the inserter —
-- unlike everything else in this app, which only ever writes rows about
-- yourself. This policy makes that explicit rather than relying on
-- whatever's already there (unknown, possibly nothing, possibly stricter).
--
-- Safe to run even if RLS/policies already exist: Postgres RLS policies for
-- the same command are OR'd together, so this only adds permission, it
-- can't remove any narrower policy already in place.

alter table public.notification_log enable row level security;

drop policy if exists "Authenticated users can notify other users" on public.notification_log;
create policy "Authenticated users can notify other users"
  on public.notification_log
  for insert
  to authenticated
  with check (true);

drop policy if exists "Users read their own notifications" on public.notification_log;
create policy "Users read their own notifications"
  on public.notification_log
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users mark their own notifications read" on public.notification_log;
create policy "Users mark their own notifications read"
  on public.notification_log
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
