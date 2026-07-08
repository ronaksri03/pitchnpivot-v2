import { getSupabaseServerClient } from "@/lib/supabase/server";

// PostgREST resource embedding (e.g. "*, managers(name, company)") requires a
// registered foreign key relationship in the schema cache. We can't confirm
// one exists here, so every join below is done manually in JS instead —
// same approach as lib/reels.js.

export async function getOpenProjects(viewerId = null) {
  const supabase = getSupabaseServerClient();

  // Public projects are visible to everyone; "assigned" projects are private
  // to the individual they were assigned to (matches v1's model).
  let query = supabase
    .from("manager_projects")
    .select("*")
    .eq("status", "open")
    .order("created_at", { ascending: false });

  query = viewerId
    ? query.or(`visibility.eq.public,and(visibility.eq.assigned,assigned_to.eq.${viewerId})`)
    : query.eq("visibility", "public");

  const { data: projects } = await query;

  if (!projects?.length) return [];

  const managerIds = [...new Set(projects.map((p) => p.manager_id).filter(Boolean))];
  const { data: managers } = await supabase
    .from("managers")
    .select("id, name, company")
    .in("id", managerIds);

  const managerById = new Map((managers ?? []).map((m) => [m.id, m]));

  return projects.map((p) => ({ ...p, manager: managerById.get(p.manager_id) ?? null }));
}

export async function getManagerProjects(managerId) {
  const supabase = getSupabaseServerClient();

  const { data: projects } = await supabase
    .from("manager_projects")
    .select("*")
    .eq("manager_id", managerId)
    .order("created_at", { ascending: false });

  return projects ?? [];
}

export async function getMySubmissions(individualId) {
  const supabase = getSupabaseServerClient();

  const { data: submissions } = await supabase
    .from("project_submissions")
    .select("*")
    .eq("individual_id", individualId)
    .order("submitted_at", { ascending: false });

  if (!submissions?.length) return [];

  const projectIds = [...new Set(submissions.map((s) => s.project_id).filter(Boolean))];
  const { data: projects } = await supabase
    .from("manager_projects")
    .select("id, title, pay_type, status")
    .in("id", projectIds);

  const projectById = new Map((projects ?? []).map((p) => [p.id, p]));

  return submissions.map((s) => ({ ...s, project: projectById.get(s.project_id) ?? null }));
}

export async function getProjectSubmissions(projectId) {
  const supabase = getSupabaseServerClient();

  const { data: submissions } = await supabase
    .from("project_submissions")
    .select("*")
    .eq("project_id", projectId)
    .order("submitted_at", { ascending: false });

  if (!submissions?.length) return [];

  const individualIds = [...new Set(submissions.map((s) => s.individual_id).filter(Boolean))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username, first_name, last_name")
    .in("id", individualIds);

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));

  return submissions.map((s) => ({ ...s, profile: profileById.get(s.individual_id) ?? null }));
}
