"use client";

import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { notify } from "@/lib/notifications";

const PAY_LABELS = {
  paid: "Paid",
  bounty: "Bounty",
  equity: "Equity",
  unpaid: "Unpaid",
  tbd: "Pay TBD",
};

function formatSalary(job) {
  if (!job.salary_min && !job.salary_max) return PAY_LABELS[job.pay_type] ?? job.pay_type;
  const fmt = (n) => `$${Math.round(n / 1000)}k`;
  if (job.salary_min && job.salary_max) return `${fmt(job.salary_min)}–${fmt(job.salary_max)}`;
  return fmt(job.salary_min || job.salary_max);
}

export default function IndividualJobBoard({ userId, initialJobs, initialApplications }) {
  const [applications, setApplications] = useState(initialApplications);
  const [applyingTo, setApplyingTo] = useState(null);
  const [reels, setReels] = useState([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [reelId, setReelId] = useState("");
  const [coverNote, setCoverNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function openApply(job) {
    setApplyingTo(job);
    setVideoUrl("");
    setReelId("");
    setCoverNote("");
    setError("");

    const supabase = getSupabaseBrowserClient();
    const { data } = await supabase
      .from("reels")
      .select("id, title, url")
      .eq("user_id", userId)
      .eq("visibility", "public")
      .order("created_at", { ascending: false });
    setReels(data ?? []);
  }

  async function handleApply(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const chosenReel = reels.find((r) => r.id === reelId);
    const supabase = getSupabaseBrowserClient();
    const { data, error: insertError } = await supabase
      .from("job_applications")
      .insert({
        job_id: applyingTo.id,
        individual_id: userId,
        video_url: videoUrl || chosenReel?.url || null,
        reel_id: reelId || null,
        cover_note: coverNote || null,
        status: "pending",
      })
      .select()
      .single();

    setSaving(false);

    if (insertError) {
      setError(insertError.code === "23505" ? "Already applied." : insertError.message);
      return;
    }

    setApplications([data, ...applications]);
    if (applyingTo.manager_id) {
      await notify(supabase, {
        userId: applyingTo.manager_id,
        type: "new_application",
        payload: { jobId: applyingTo.id, jobTitle: applyingTo.title },
      });
    }
    setApplyingTo(null);
  }

  // Group by the viewer's application status, mirroring the Project Lab.
  const openById = new Map(initialJobs.map((j) => [j.id, j]));
  const appliedIds = new Set(applications.map((a) => a.job_id));

  const applied = { accepted: [], pending: [], rejected: [] };
  for (const app of applications) {
    const open = openById.get(app.job_id);
    const job = open || app.job || { id: app.job_id, title: "Role" };
    (applied[app.status] || applied.pending).push({ job, application: app });
  }
  const notApplied = initialJobs.filter((j) => !appliedIds.has(j.id));
  const hasAnyApplication = applications.length > 0;

  function renderJobCard(job, application) {
    return (
      <div key={job.id} className="card job">
        <div className="top">
          <div className="jlogo">{job.manager?.company?.[0] ?? "?"}</div>
          <div>
            <h3>{job.title}</h3>
            {(job.manager?.company || job.work_type) && (
              <div className="co">
                {[job.manager?.company, job.location || job.work_type].filter(Boolean).join(" · ")}
              </div>
            )}
          </div>
        </div>
        <div className="chips">
          {job.work_type && <span className="chip">{job.work_type}</span>}
          {job.employment_type && <span className="chip">{job.employment_type}</span>}
          {(job.skills_required ?? []).map((s) => (
            <span key={s} className="chip">
              {s}
            </span>
          ))}
        </div>
        <div className="foot">
          <span>{formatSalary(job)}</span>
          {application ? (
            <span className={`pill ${application.status}`}>{application.status}</span>
          ) : (
            <button type="button" className="apply" onClick={() => openApply(job)}>
              Apply with your pitch →
            </button>
          )}
        </div>
      </div>
    );
  }

  const groups = [
    { id: "accepted", label: "Accepted", items: applied.accepted },
    { id: "pending", label: "Pending", items: applied.pending },
    { id: "rejected", label: "Rejected", items: applied.rejected },
  ];

  return (
    <main>
      <section style={{ paddingTop: 120 }}>
        <span className="label">Open roles</span>
        <h1 className="display" style={{ fontSize: "clamp(30px,4.5vw,48px)" }}>
          Jobs that hire on proof, not paper
        </h1>
        <p style={{ color: "var(--muted)", marginTop: 8, marginBottom: 32, maxWidth: "56ch" }}>
          Roles from teams that would rather watch what you can do than scan a CV.
        </p>

        {hasAnyApplication &&
          groups
            .filter((g) => g.items.length > 0)
            .map((g) => (
              <div key={g.id} id={g.id} style={{ marginBottom: 36, scrollMarginTop: 90 }}>
                <span className="label">
                  {g.label} ({g.items.length})
                </span>
                <div className="grid">
                  {g.items.map(({ job, application }) => renderJobCard(job, application))}
                </div>
              </div>
            ))}

        <div id="open" style={{ scrollMarginTop: 90 }}>
          <span className="label">Open — not yet applied ({notApplied.length})</span>
          {notApplied.length === 0 ? (
            <div className="card" style={{ textAlign: "center", color: "var(--muted)" }}>
              {hasAnyApplication
                ? "You've applied to every open role. Nice."
                : "No open roles right now — check back soon."}
            </div>
          ) : (
            <div className="grid">{notApplied.map((job) => renderJobCard(job, null))}</div>
          )}
        </div>
      </section>

      {applyingTo && (
        <div className="modal-overlay" onClick={() => setApplyingTo(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <span className="label">Apply</span>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>{applyingTo.title}</h2>

            <form onSubmit={handleApply} className="authform">
              <label className="fieldlabel" htmlFor="reel">
                Attach a reel
              </label>
              <select
                id="reel"
                className="field"
                value={reelId}
                onChange={(e) => setReelId(e.target.value)}
              >
                <option value="">No reel</option>
                {reels.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title || "Untitled pitch"}
                  </option>
                ))}
              </select>

              <label className="fieldlabel" htmlFor="video-url">
                Or paste a video link
              </label>
              <input
                id="video-url"
                className="field"
                placeholder="https://youtube.com/watch?v=..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
              />

              <label className="fieldlabel" htmlFor="cover-note">
                Cover note (optional)
              </label>
              <textarea
                id="cover-note"
                className="field"
                rows={3}
                placeholder="Why you're a fit for this role…"
                value={coverNote}
                onChange={(e) => setCoverNote(e.target.value)}
              />

              {error && <p className="msg error">{error}</p>}

              <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
                <button type="submit" className="cta big" disabled={saving}>
                  {saving ? "Submitting…" : "Submit application"}
                </button>
                <button type="button" className="ghost" onClick={() => setApplyingTo(null)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
