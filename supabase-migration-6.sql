-- pitchNpivot — allow managers to verify (write onto) an applicant's reel
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor → New query).
--
-- Verification writes the is_verified/verified_* fields onto the INDIVIDUAL's
-- reel, but the write is performed by the MANAGER — who isn't the reel owner.
-- The existing reels UPDATE policy only lets the owner update their own reel,
-- so the manager's verification update matches zero rows and fails with
-- "Cannot coerce the result to a single JSON object".
--
-- This adds a second UPDATE policy: a manager may update a reel belonging to
-- an individual who submitted to a project OR applied to a job that the
-- manager owns. Policies for the same command are OR'd, so the owner can
-- still update their own reels. The app also enforces these same checks in
-- /api/verify-reel (defense in depth).

drop policy if exists "Managers verify reels of their applicants" on public.reels;
create policy "Managers verify reels of their applicants" on public.reels
  for update
  using (
    exists (
      select 1
      from public.project_submissions ps
      join public.manager_projects mp on mp.id = ps.project_id
      where ps.individual_id = reels.user_id
        and mp.manager_id = auth.uid()
    )
    or exists (
      select 1
      from public.job_applications ja
      join public.jobs j on j.id = ja.job_id
      where ja.individual_id = reels.user_id
        and j.manager_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.project_submissions ps
      join public.manager_projects mp on mp.id = ps.project_id
      where ps.individual_id = reels.user_id
        and mp.manager_id = auth.uid()
    )
    or exists (
      select 1
      from public.job_applications ja
      join public.jobs j on j.id = ja.job_id
      where ja.individual_id = reels.user_id
        and j.manager_id = auth.uid()
    )
  );
