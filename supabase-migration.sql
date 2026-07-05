-- pitchNpivot — patent-alignment migration
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor → New query).
-- Adds the two employer-attribution columns the patent claims (claim 1g / §4.5)
-- that were missing from the reels table.

alter table public.reels
  add column if not exists verified_by_name text,
  add column if not exists verified_by_company text;

-- job_applications.reel_id already exists; no change needed there.
-- No data is modified — these columns are nullable and only populated
-- when an employer verifies a reel attached to a submission.
