import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function getManagerDashboard(userId) {
  const supabase = getSupabaseServerClient();

  const [{ data: projects }, { data: jobs }, { data: verifiedReels }] = await Promise.all([
    supabase
      .from("manager_projects")
      .select("id, title, status")
      .eq("manager_id", userId),
    supabase.from("jobs").select("id, title, status").eq("manager_id", userId),
    supabase
      .from("reels")
      .select("id, title")
      .eq("verified_by", userId)
      .eq("is_verified", true),
  ]);

  const projectList = projects ?? [];
  const jobList = jobs ?? [];
  const projectIds = projectList.map((p) => p.id);
  const jobIds = jobList.map((j) => j.id);

  const [{ data: submissions }, { data: applications }] = await Promise.all([
    projectIds.length
      ? supabase
          .from("project_submissions")
          .select("id, status, project_id, individual_id, submitted_at")
          .in("project_id", projectIds)
      : Promise.resolve({ data: [] }),
    jobIds.length
      ? supabase
          .from("job_applications")
          .select("id, status, job_id, individual_id, submitted_at")
          .in("job_id", jobIds)
      : Promise.resolve({ data: [] }),
  ]);

  const subs = submissions ?? [];
  const apps = applications ?? [];

  const projectTitle = new Map(projectList.map((p) => [p.id, p.title]));
  const jobTitle = new Map(jobList.map((j) => [j.id, j.title]));

  // Merge into a single recent-activity stream.
  const activity = [
    ...subs.map((s) => ({
      id: `s-${s.id}`,
      kind: "project",
      status: s.status,
      individual_id: s.individual_id,
      postingTitle: projectTitle.get(s.project_id) || "Project",
      at: s.submitted_at,
      href: "/lab",
    })),
    ...apps.map((a) => ({
      id: `a-${a.id}`,
      kind: "job",
      status: a.status,
      individual_id: a.individual_id,
      postingTitle: jobTitle.get(a.job_id) || "Role",
      at: a.submitted_at,
      href: "/jobs",
    })),
  ].sort((x, y) => new Date(y.at ?? 0) - new Date(x.at ?? 0));

  const individualIds = [...new Set(activity.map((a) => a.individual_id).filter(Boolean))];
  const { data: profiles } = individualIds.length
    ? await supabase
        .from("profiles")
        .select("id, username, first_name, last_name")
        .in("id", individualIds)
    : { data: [] };
  const nameById = new Map(
    (profiles ?? []).map((p) => [
      p.id,
      [p.first_name, p.last_name].filter(Boolean).join(" ") || p.username || "Applicant",
    ])
  );

  const recent = activity.slice(0, 8).map((a) => ({
    ...a,
    applicantName: nameById.get(a.individual_id) || "Applicant",
  }));

  const allApplicants = [...subs, ...apps];
  const stats = {
    projects: projectList.length,
    jobs: jobList.length,
    applicants: allApplicants.length,
    pending: allApplicants.filter((a) => a.status === "pending").length,
    accepted: allApplicants.filter((a) => a.status === "accepted").length,
    verifications: (verifiedReels ?? []).length,
  };

  return { stats, recent };
}
