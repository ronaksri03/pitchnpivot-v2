import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function getOpenJobs() {
  const supabase = getSupabaseServerClient();

  const { data: jobs } = await supabase
    .from("jobs")
    .select("*")
    .eq("status", "open")
    .gt("closes_at", new Date().toISOString())
    .order("created_at", { ascending: false });

  if (!jobs?.length) return [];

  const managerIds = [...new Set(jobs.map((j) => j.manager_id).filter(Boolean))];
  const { data: managers } = await supabase
    .from("managers")
    .select("id, name, company")
    .in("id", managerIds);

  const managerById = new Map((managers ?? []).map((m) => [m.id, m]));

  return jobs.map((j) => ({ ...j, manager: managerById.get(j.manager_id) ?? null }));
}

export async function getManagerJobs(managerId) {
  const supabase = getSupabaseServerClient();

  const { data: jobs } = await supabase
    .from("jobs")
    .select("*")
    .eq("manager_id", managerId)
    .order("created_at", { ascending: false });

  return jobs ?? [];
}

export async function getMyJobApplications(individualId) {
  const supabase = getSupabaseServerClient();

  const { data: applications } = await supabase
    .from("job_applications")
    .select("*")
    .eq("individual_id", individualId)
    .order("submitted_at", { ascending: false });

  if (!applications?.length) return [];

  const jobIds = [...new Set(applications.map((a) => a.job_id).filter(Boolean))];
  const { data: jobs } = await supabase.from("jobs").select("id, title").in("id", jobIds);

  const jobById = new Map((jobs ?? []).map((j) => [j.id, j]));

  return applications.map((a) => ({ ...a, job: jobById.get(a.job_id) ?? null }));
}

export async function getJobApplicants(jobId) {
  const supabase = getSupabaseServerClient();

  const { data: applications } = await supabase
    .from("job_applications")
    .select("*")
    .eq("job_id", jobId)
    .order("submitted_at", { ascending: false });

  if (!applications?.length) return [];

  const individualIds = [...new Set(applications.map((a) => a.individual_id).filter(Boolean))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username, first_name, last_name")
    .in("id", individualIds);

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));

  return applications.map((a) => ({ ...a, profile: profileById.get(a.individual_id) ?? null }));
}
