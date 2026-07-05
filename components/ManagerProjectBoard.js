"use client";

import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const PAY_TYPES = [
  { value: "paid", label: "Paid" },
  { value: "bounty", label: "Bounty" },
  { value: "equity", label: "Equity" },
  { value: "unpaid", label: "Unpaid" },
  { value: "tbd", label: "Pay TBD" },
];

const EMPTY_FORM = {
  title: "",
  description: "",
  timeline: "",
  payType: "paid",
  skillsRequired: "",
  visibility: "public",
};

export default function ManagerProjectBoard({ managerId, initialProjects }) {
  const [projects, setProjects] = useState(initialProjects);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [selectedProject, setSelectedProject] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [verifying, setVerifying] = useState(null);
  const [verificationNote, setVerificationNote] = useState("");
  const [verifySaving, setVerifySaving] = useState(false);

  async function handleCreate(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const supabase = getSupabaseBrowserClient();
    const { data, error: insertError } = await supabase
      .from("manager_projects")
      .insert({
        manager_id: managerId,
        title: form.title.trim(),
        description: form.description || null,
        timeline: form.timeline || null,
        pay_type: form.payType,
        skills_required: form.skillsRequired
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        visibility: form.visibility,
        status: "open",
      })
      .select()
      .single();

    setSaving(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }

    setProjects([data, ...projects]);
    setShowForm(false);
    setForm(EMPTY_FORM);
  }

  async function toggleStatus(project) {
    const nextStatus = project.status === "open" ? "closed" : "open";
    const supabase = getSupabaseBrowserClient();
    const { data, error: updateError } = await supabase
      .from("manager_projects")
      .update({ status: nextStatus })
      .eq("id", project.id)
      .select()
      .single();

    if (updateError) return;
    setProjects(projects.map((p) => (p.id === project.id ? data : p)));
  }

  async function openSubmissions(project) {
    setSelectedProject(project);
    setLoadingSubmissions(true);
    setSubmissions([]);

    const supabase = getSupabaseBrowserClient();
    const { data: subs } = await supabase
      .from("project_submissions")
      .select("*")
      .eq("project_id", project.id)
      .order("submitted_at", { ascending: false });

    const list = subs ?? [];
    const individualIds = [...new Set(list.map((s) => s.individual_id))];
    const reelIds = [...new Set(list.map((s) => s.reel_id).filter(Boolean))];

    const [{ data: profiles }, { data: reels }] = await Promise.all([
      individualIds.length
        ? supabase.from("profiles").select("id, username, first_name, last_name").in("id", individualIds)
        : Promise.resolve({ data: [] }),
      reelIds.length
        ? supabase.from("reels").select("id, title, url, is_verified").in("id", reelIds)
        : Promise.resolve({ data: [] }),
    ]);

    const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));
    const reelById = new Map((reels ?? []).map((r) => [r.id, r]));

    setSubmissions(
      list.map((s) => ({
        ...s,
        profile: profileById.get(s.individual_id) ?? null,
        reel: s.reel_id ? reelById.get(s.reel_id) ?? null : null,
      }))
    );
    setLoadingSubmissions(false);
  }

  async function updateSubmissionStatus(submission, status) {
    const supabase = getSupabaseBrowserClient();
    const { error: updateError } = await supabase
      .from("project_submissions")
      .update({ status })
      .eq("id", submission.id);

    if (updateError) return;
    setSubmissions(submissions.map((s) => (s.id === submission.id ? { ...s, status } : s)));
  }

  function openVerify(submission) {
    setVerifying(submission);
    setVerificationNote("");
  }

  async function handleVerify(e) {
    e.preventDefault();
    setVerifySaving(true);

    const supabase = getSupabaseBrowserClient();
    const { error: updateError } = await supabase
      .from("reels")
      .update({
        is_verified: true,
        verified_by: managerId,
        verified_at: new Date().toISOString(),
        verification_note: verificationNote || null,
        verified_project_title: selectedProject?.title ?? null,
      })
      .eq("id", verifying.reel_id);

    setVerifySaving(false);
    if (updateError) return;

    setSubmissions(
      submissions.map((s) =>
        s.id === verifying.id ? { ...s, reel: { ...s.reel, is_verified: true } } : s
      )
    );
    setVerifying(null);
  }

  return (
    <main>
      <section style={{ paddingTop: 120 }}>
        <span className="label">Project Lab</span>
        <h1 className="display" style={{ fontSize: "clamp(30px,4.5vw,48px)" }}>
          Your posted projects
        </h1>

        <button
          type="button"
          className="cta big"
          style={{ margin: "24px 0" }}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Cancel" : "+ New project"}
        </button>

        {showForm && (
          <form onSubmit={handleCreate} className="authform" style={{ marginBottom: 32, maxWidth: 480 }}>
            <label className="fieldlabel" htmlFor="p-title">
              Title
            </label>
            <input
              id="p-title"
              className="field"
              placeholder="e.g. Build a landing page"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />

            <label className="fieldlabel" htmlFor="p-desc">
              Description
            </label>
            <textarea
              id="p-desc"
              className="field"
              rows={3}
              placeholder="What needs to be built? What does success look like?"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />

            <label className="fieldlabel" htmlFor="p-timeline">
              Timeline
            </label>
            <input
              id="p-timeline"
              className="field"
              placeholder="e.g. 2 weeks"
              value={form.timeline}
              onChange={(e) => setForm({ ...form, timeline: e.target.value })}
            />

            <label className="fieldlabel" htmlFor="p-pay">
              Pay type
            </label>
            <select
              id="p-pay"
              className="field"
              value={form.payType}
              onChange={(e) => setForm({ ...form, payType: e.target.value })}
            >
              {PAY_TYPES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>

            <label className="fieldlabel" htmlFor="p-skills">
              Skills required (comma-separated)
            </label>
            <input
              id="p-skills"
              className="field"
              placeholder="React, Next.js, Supabase"
              value={form.skillsRequired}
              onChange={(e) => setForm({ ...form, skillsRequired: e.target.value })}
            />

            <label className="fieldlabel" htmlFor="p-visibility">
              Visibility
            </label>
            <select
              id="p-visibility"
              className="field"
              value={form.visibility}
              onChange={(e) => setForm({ ...form, visibility: e.target.value })}
            >
              <option value="public">Public — visible on the Lab</option>
              <option value="private">Private — hidden from listings</option>
            </select>

            {error && <p className="msg error">{error}</p>}

            <button type="submit" className="cta big" disabled={saving}>
              {saving ? "Posting…" : "Post project"}
            </button>
          </form>
        )}

        {projects.length === 0 ? (
          <div className="card" style={{ textAlign: "center", color: "var(--muted)" }}>
            No projects posted yet.
          </div>
        ) : (
          <div className="grid">
            {projects.map((project) => (
              <div key={project.id} className="card job">
                <div className="top">
                  <div>
                    <h3>{project.title}</h3>
                    <div className="co">{project.pay_type} · {project.timeline || "No timeline set"}</div>
                  </div>
                </div>
                <div className="chips">
                  {(project.skills_required ?? []).map((s) => (
                    <span key={s} className="chip">
                      {s}
                    </span>
                  ))}
                </div>
                <div className="foot">
                  <span className={`pill ${project.status}`}>{project.status}</span>
                  <div style={{ display: "flex", gap: 12 }}>
                    <button type="button" className="apply" onClick={() => openSubmissions(project)}>
                      Submissions →
                    </button>
                    <button type="button" className="apply" onClick={() => toggleStatus(project)}>
                      {project.status === "open" ? "Close" : "Reopen"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {selectedProject && (
        <div className="modal-overlay" onClick={() => setSelectedProject(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <span className="label">Submissions</span>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>
              {selectedProject.title}
            </h2>

            {loadingSubmissions ? (
              <p className="msg">Loading…</p>
            ) : submissions.length === 0 ? (
              <p className="msg">No applications yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {submissions.map((s) => (
                  <div key={s.id} className="card" style={{ padding: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                      <b>
                        {[s.profile?.first_name, s.profile?.last_name].filter(Boolean).join(" ") ||
                          s.profile?.username ||
                          "Applicant"}
                      </b>
                      <span className={`pill ${s.status}`}>{s.status}</span>
                    </div>
                    {s.note && (
                      <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 6 }}>{s.note}</p>
                    )}
                    <div style={{ display: "flex", gap: 12, marginTop: 8, flexWrap: "wrap" }}>
                      {s.submission_url && (
                        <a
                          href={s.submission_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="apply"
                        >
                          View submission ↗
                        </a>
                      )}
                      {s.reel && (
                        <a href={s.reel.url} target="_blank" rel="noopener noreferrer" className="apply">
                          Watch reel ↗
                        </a>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
                      {s.status !== "accepted" && (
                        <button
                          type="button"
                          className="ghost"
                          onClick={() => updateSubmissionStatus(s, "accepted")}
                        >
                          Accept
                        </button>
                      )}
                      {s.status !== "rejected" && (
                        <button
                          type="button"
                          className="ghost"
                          onClick={() => updateSubmissionStatus(s, "rejected")}
                        >
                          Reject
                        </button>
                      )}
                      {s.reel && !s.reel.is_verified && (
                        <button
                          type="button"
                          className="cta"
                          onClick={() => openVerify(s)}
                        >
                          ✦ Verify Reel
                        </button>
                      )}
                      {s.reel?.is_verified && <span className="msg">✦ Reel verified</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              className="ghost"
              style={{ marginTop: 20 }}
              onClick={() => setSelectedProject(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {verifying && (
        <div className="modal-overlay" onClick={() => setVerifying(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <span className="label">✦ Verify a Reel</span>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
              {[verifying.profile?.first_name, verifying.profile?.last_name].filter(Boolean).join(" ") ||
                "Individual"}
            </h2>
            <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.6, marginBottom: 16 }}>
              By verifying, you confirm this individual completed real work on{" "}
              <strong style={{ color: "var(--volt)" }}>{selectedProject?.title}</strong> and this
              reel accurately demonstrates their contribution. This is permanently recorded.
            </p>
            <form onSubmit={handleVerify} className="authform">
              <label className="fieldlabel" htmlFor="verify-note">
                Verification note (optional)
              </label>
              <textarea
                id="verify-note"
                className="field"
                rows={3}
                value={verificationNote}
                onChange={(e) => setVerificationNote(e.target.value)}
              />
              <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
                <button type="submit" className="cta big" disabled={verifySaving}>
                  {verifySaving ? "Verifying…" : "Confirm verification"}
                </button>
                <button type="button" className="ghost" onClick={() => setVerifying(null)}>
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
