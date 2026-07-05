-- pitchNpivot — connection graph migration
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor → New query).
-- Creates two new tables (this feature has no v1 precedent — it's new,
-- not restored) backing the Save and Connect buttons on reel cards.
-- Both are RLS-enabled and scoped so each user can only manage rows that
-- involve them.

create table if not exists public.saved_reels (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  reel_id uuid not null references public.reels(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, reel_id)
);

alter table public.saved_reels enable row level security;

create policy "Users manage their own saved reels" on public.saved_reels
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table if not exists public.connections (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted')),
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  unique (requester_id, recipient_id),
  check (requester_id <> recipient_id)
);

alter table public.connections enable row level security;

create policy "Users see connections involving them" on public.connections
  for select
  using (auth.uid() = requester_id or auth.uid() = recipient_id);

create policy "Users send connection requests as themselves" on public.connections
  for insert
  with check (auth.uid() = requester_id);

create policy "Recipients respond to requests, either side can update" on public.connections
  for update
  using (auth.uid() = requester_id or auth.uid() = recipient_id)
  with check (auth.uid() = requester_id or auth.uid() = recipient_id);

create policy "Either side can delete a connection" on public.connections
  for delete
  using (auth.uid() = requester_id or auth.uid() = recipient_id);
