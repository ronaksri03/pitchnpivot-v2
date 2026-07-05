import Link from "next/link";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getAccountType } from "@/lib/accountType";

export const metadata = {
  title: "Dashboard",
  description: "Your activity at a glance.",
};

const STATUS_LABELS = {
  pending: { className: "pill pending", label: "Pending" },
  accepted: { className: "pill accepted", label: "Accepted" },
  rejected: { className: "pill rejected", label: "Rejected" },
};

export default async function DashboardPage() {
  const supabase = getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth?next=/dashboard");
  if (getAccountType(user) === "manager") redirect("/lab");

  const [reelsRes, projectsRes, viewsRes, submissionsRes] = await Promise.all([
    supabase.from("reels").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase
      .from("individual_projects")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("profile_views")
      .select("*")
      .eq("profile_user_id", user.id)
      .order("viewed_at", { ascending: false })
      .limit(5),
    supabase
      .from("project_submissions")
      .select("*")
      .eq("individual_id", user.id)
      .order("submitted_at", { ascending: false })
      .limit(10),
  ]);

  const submissions = submissionsRes.data ?? [];
  const views = viewsRes.data ?? [];

  const managerIds = [...new Set(views.map((v) => v.manager_id).filter(Boolean))];
  const projectIds = [...new Set(submissions.map((s) => s.project_id).filter(Boolean))];

  const [{ data: managers }, { data: projects }] = await Promise.all([
    managerIds.length
      ? supabase.from("managers").select("id, name, company").in("id", managerIds)
      : Promise.resolve({ data: [] }),
    projectIds.length
      ? supabase.from("manager_projects").select("id, title").in("id", projectIds)
      : Promise.resolve({ data: [] }),
  ]);

  const managerById = new Map((managers ?? []).map((m) => [m.id, m]));
  const projectById = new Map((projects ?? []).map((p) => [p.id, p]));

  const stats = {
    reels: reelsRes.count ?? 0,
    projects: projectsRes.count ?? 0,
    views: views.length,
    submissions: submissions.length,
    accepted: submissions.filter((s) => s.status === "accepted").length,
    pending: submissions.filter((s) => s.status === "pending").length,
  };

  const cards = [
    { label: "Reels", value: stats.reels, href: "/profile" },
    { label: "Projects", value: stats.projects, href: "/portfolio" },
    { label: "Profile Views", value: stats.views, href: "/profile" },
    { label: "Applications", value: stats.submissions, href: "/lab" },
    { label: "Accepted", value: stats.accepted, href: "/lab" },
    { label: "Pending", value: stats.pending, href: "/lab" },
  ];

  return (
    <main>
      <section style={{ paddingTop: 120 }}>
        <span className="label">Overview</span>
        <h1 className="display" style={{ fontSize: "clamp(30px,4.5vw,48px)" }}>
          Dashboard
        </h1>
        <p style={{ color: "var(--muted)", marginTop: 8, marginBottom: 32 }}>
          Your activity at a glance.
        </p>

        <div className="grid" style={{ marginBottom: 40 }}>
          {cards.map((c) => (
            <Link key={c.label} href={c.href} className="card job">
              <div style={{ fontSize: 32, fontWeight: 800, color: "var(--volt)" }}>{c.value}</div>
              <div style={{ fontSize: 12, color: "var(--muted)", textTransform: "uppercase" }}>
                {c.label}
              </div>
            </Link>
          ))}
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 40 }}>
          <Link href="/profile" className="ghost">
            ✎ Edit Profile
          </Link>
          <Link href="/lab" className="ghost">
            🔍 Browse Projects
          </Link>
          <Link href="/portfolio" className="ghost">
            + Add Project
          </Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
          <div>
            <span className="label">Recent Profile Views</span>
            {views.length === 0 ? (
              <div className="card" style={{ color: "var(--muted)", textAlign: "center" }}>
                No views yet — share your profile!
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {views.map((v) => {
                  const manager = managerById.get(v.manager_id);
                  return (
                    <div key={v.id} className="card" style={{ padding: 14 }}>
                      <b>{manager?.name || "A manager"}</b>
                      {manager?.company && (
                        <div style={{ fontSize: 12, color: "var(--muted)" }}>{manager.company}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <span className="label">Recent Applications</span>
            {submissions.length === 0 ? (
              <div className="card" style={{ color: "var(--muted)", textAlign: "center" }}>
                No applications yet — browse open projects!
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {submissions.slice(0, 5).map((s) => {
                  const project = projectById.get(s.project_id);
                  const status = STATUS_LABELS[s.status] ?? STATUS_LABELS.pending;
                  return (
                    <div
                      key={s.id}
                      className="card"
                      style={{
                        padding: 14,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <b>{project?.title || "Project"}</b>
                        <div style={{ fontSize: 12, color: "var(--muted)" }}>
                          {new Date(s.submitted_at).toLocaleDateString()}
                        </div>
                      </div>
                      <span className={status.className}>{status.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
