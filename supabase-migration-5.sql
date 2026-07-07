-- pitchNpivot — direct messaging migration
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor → New query).
-- New feature, no v1 precedent. Backs the /messages inbox and threads.

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  read boolean not null default false,
  created_at timestamptz not null default now(),
  check (sender_id <> recipient_id)
);

create index if not exists messages_pair_idx
  on public.messages (sender_id, recipient_id, created_at);
create index if not exists messages_recipient_idx
  on public.messages (recipient_id, created_at);

alter table public.messages enable row level security;

drop policy if exists "Users send messages as themselves" on public.messages;
create policy "Users send messages as themselves" on public.messages
  for insert
  with check (auth.uid() = sender_id);

drop policy if exists "Users read messages they're part of" on public.messages;
create policy "Users read messages they're part of" on public.messages
  for select
  using (auth.uid() = sender_id or auth.uid() = recipient_id);

drop policy if exists "Recipients mark messages read" on public.messages;
create policy "Recipients mark messages read" on public.messages
  for update
  using (auth.uid() = recipient_id)
  with check (auth.uid() = recipient_id);
