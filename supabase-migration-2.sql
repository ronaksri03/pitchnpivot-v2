-- pitchNpivot — credential signing migration
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor → New query).
-- Adds one column so verified reels carry a server-computed HMAC signature,
-- making the /verify/[reelId] credential page's authenticity check hold up
-- even against someone with raw database read/write access (they'd need
-- the server-only signing secret to produce a signature that validates).

alter table public.reels
  add column if not exists verification_signature text;

-- Nullable, no data modified. Only populated going forward by the
-- /api/verify-reel route when a manager verifies a reel.
