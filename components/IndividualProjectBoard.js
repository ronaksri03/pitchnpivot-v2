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

export default function IndividualProjectBoard({ userId, initialProjects, initialSubmissions }) {
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [applyingTo, setApplyingTo] = useState(null);
  const [reels, setReels] = useState([]);
  const [submissionUrl, setSubmissionUrl] = useState("");
  const [note, setNote] = useState("");
  const [reelId, setReelId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submissionByProject = new Map(submissions.map((s) => [s.project_id, s]));

  async function openApply(project) {
    setApplyingTo(project);
    setSubmissionUrl("");
    setNote("");
    setReelId("");
    setError("");

    const supabase = getSupabaseBrowserClient();
    const { data } = await supabase
      .from("reels")
      .select("id, title")
      .eq("user_id", userId)
      .eq("visibility", "public")
      .order("created_at", { ascending: false });
    setReels(data ?? []);
  }

  async function handleApply(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const supabase = getSupabaseBrowserClient();
    const { data, error: insertError } = await supabase
      .from("project_submissions")
      .insert({
        project_id: applyingTo.id,
        individual_id: userId,
        submission_url: submissionUrl || null,
        note: note || null,
        reel_id: reelId || null,
        status: "pending",
      })
      .select()
      .single();

    setSaving(false);

    if (insertError) {
      setError(insertError.code === "23505" ? "Already submitted." : insertError.message);
      return;
    }

    setSubmissions([data, ...submissions]);
    if (applyingTo.manager_id) {
      await notify(supabase, {
        userId: applyingTo.manager_id,
        type: "new_submission",
        payload: { projectId: applyingTo.id, projectTitle: applyingTo.title },
      });
    }
    setApplyingTo(null);
  }

  return (
    <main>
      <section style={{ paddingTop: 120 }}>
        <span className="label">Project Lab</span>
        <h1 className="display" style={{ fontSize: "clamp(30px,4.5vw,48px)" }}>
          Open projects &amp; collabs
        </h1>
        <p style={{ color: "var(--muted)", marginTop: 8, marginBottom: 32, maxWidth: "56ch" }}>
          Real projects posted by managers. Apply with a link to your work and,
          optionally, one of your pitch reels as proof.
        </p>

        {initialProjects.length === 0 ? (
          <div className="card" style={{ textAlign: "center", color: "var(--muted)" }}>
            No open projects right now — check back soon.
          </div>
        ) : (
          <div className="grid">
            {initialProjects.map((project) => {
              const submission = submissionByProject.get(project.id);
              return (
                <div key={project.id} className="card job">
                  <div className="top">
                    <div>
                      <h3>{project.title}</h3>
                      <div className="co">
                        {project.manager?.name}
                        {project.manager?.company ? ` · ${project.manager.company}` : ""}
                      </div>
                    </div>
                  </div>
                  {project.description && (
                    <p style={{ fontSize: 13, color: "var(--muted)" }}>{project.description}</p>
                  )}
                  <div className="chips">
                    {(project.skills_required ?? []).map((s) => (
                      <span key={s} className="chip">
                        {s}
                      </span>
                    ))}
                  </div>
                  <div className="foot">
                    <span>
                      {PAY_LABELS[project.pay_type] ?? project.pay_type}
                      {project.timeline ? ` · ${project.timeline}` : ""}
                    </span>
                    {submission ? (
                      <span className={`pill ${submission.status}`}>{submission.status}</span>
                    ) : (
                      <button type="button" className="apply" onClick={() => openApply(project)}>
                        Apply with your pitch →
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {applyingTo && (
        <div className="modal-overlay" onClick={() => setApplyingTo(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <span className="label">Apply</span>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>{applyingTo.title}</h2>

            <form onSubmit={handleApply} className="authform">
              <label className="fieldlabel" htmlFor="submission-url">
                Submission link
              </label>
              <input
                id="submission-url"
                className="field"
                placeholder="https://github.com/you/project"
                value={submissionUrl}
                onChange={(e) => setSubmissionUrl(e.target.value)}
              />

              <label className="fieldlabel" htmlFor="note">
                Note to manager (optional)
              </label>
              <textarea
                id="note"
                className="field"
                rows={3}
                placeholder="Describe what you built…"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />

              <label className="fieldlabel" htmlFor="reel">
                Attach a reel (optional)
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
              {reelId && (
                <p className="msg">Reel attached — the manager can verify it after reviewing your work.</p>
              )}

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
