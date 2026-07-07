import Link from "next/link";

const STATUS_LABELS = {
  pending: { className: "pill pending", label: "Pending" },
  accepted: { className: "pill accepted", label: "Accepted" },
  rejected: { className: "pill rejected", label: "Rejected" },
};

export default function ManagerDashboard({ stats, recent }) {
  const cards = [
    { label: "Projects", value: stats.projects, href: "/lab" },
    { label: "Jobs", value: stats.jobs, href: "/jobs" },
    { label: "Applicants", value: stats.applicants, href: "/lab" },
    { label: "Pending", value: stats.pending, href: "/lab" },
    { label: "Accepted", value: stats.accepted, href: "/lab" },
    { label: "Verifications issued", value: stats.verifications, href: "/lab" },
  ];

  return (
    <main>
      <section style={{ paddingTop: 120 }}>
        <span className="label">Overview</span>
        <h1 className="display" style={{ fontSize: "clamp(30px,4.5vw,48px)" }}>
          Manager dashboard
        </h1>
        <p style={{ color: "var(--muted)", marginTop: 8, marginBottom: 32 }}>
          Your postings and the talent applying to them.
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
          <Link href="/lab" className="ghost">
            + Post a project
          </Link>
          <Link href="/jobs" className="ghost">
            + Post a job
          </Link>
          <Link href="/profile" className="ghost">
            ✎ Edit profile
          </Link>
        </div>

        <span className="label">Recent applicants</span>
        {recent.length === 0 ? (
          <div className="card" style={{ color: "var(--muted)", textAlign: "center" }}>
            No applications yet. Post a project or job to start receiving pitches.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {recent.map((a) => {
              const status = STATUS_LABELS[a.status] ?? STATUS_LABELS.pending;
              return (
                <Link
                  key={a.id}
                  href={a.href}
                  className="card"
                  style={{
                    padding: 16,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div>
                    <b>{a.applicantName}</b>
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>
                      {a.kind === "project" ? "Project" : "Job"} · {a.postingTitle}
                      {a.at ? ` · ${new Date(a.at).toLocaleDateString()}` : ""}
                    </div>
                  </div>
                  <span className={status.className}>{status.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
