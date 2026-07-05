"use client";

import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const WORK_TYPES = ["remote", "hybrid", "onsite"];
const EMPLOYMENT_TYPES = ["full-time", "part-time", "contract", "freelance", "internship"];
const PAY_TYPES = [
  { value: "paid", label: "Paid" },
  { value: "bounty", label: "Bounty" },
  { value: "equity", label: "Equity" },
  { value: "unpaid", label: "Unpaid" },
  { value: "tbd", label: "Pay TBD" },
];
const DURATIONS = [
  { value: 7, label: "7 days" },
  { value: 14, label: "14 days" },
  { value: 30, label: "30 days" },
  { value: 60, label: "60 days" },
];

const EMPTY_FORM = {
  title: "",
  description: "",
  location: "",
  workType: "remote",
  employmentType: "full-time",
  payType: "paid",
  salaryMin: "",
  salaryMax: "",
  skillsRequired: "",
  duration: 30,
};

export default function ManagerJobBoard({ managerId, manager, initialJobs }) {
  const [jobs, setJobs] = useState(initialJobs);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [selectedJob, setSelectedJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [verifying, setVerifying] = useState(null);
  const [verificationNote, setVerificationNote] = useState("");
  const [verifySaving, setVerifySaving] = useState(false);

  async function handleCreate(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const closesAt = new Date(Date.now() + 86400000 * Number(form.duration)).toISOString();

    const supabase = getSupabaseBrowserClient();
    const { data, error: insertError } = await supabase
      .from("jobs")
      .insert({
        manager_id: managerId,
        title: form.title.trim(),
        description: form.description || null,
        location: form.location || null,
        work_type: form.workType,
        employment_type: form.employmentType,
        skills_required: form.skillsRequired
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        pay_type: form.payType,
        salary_min: form.salaryMin ? parseInt(form.salaryMin, 10) : null,
        salary_max: form.salaryMax ? parseInt(form.salaryMax, 10) : null,
        status: "open",
        closes_at: closesAt,
      })
      .select()
      .single();

    setSaving(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }

    setJobs([data, ...jobs]);
    setShowForm(false);
    setForm(EMPTY_FORM);
  }

  async function toggleStatus(job) {
    const nextStatus = job.status === "open" ? "closed" : "open";
    const supabase = getSupabaseBrowserClient();
    const { data, error: updateError } = await supabase
      .from("jobs")
      .update({ status: nextStatus })
      .eq("id", job.id)
      .select()
      .single();

    if (updateError) return;
    setJobs(jobs.map((j) => (j.id === job.id ? data : j)));
  }

  async function openApplicants(job) {
    setSelectedJob(job);
    setLoadingApplicants(true);
    setApplicants([]);

    const supabase = getSupabaseBrowserClient();
    const { data: apps } = await supabase
      .from("job_applications")
      .select("*")
      .eq("job_id", job.id)
      .order("submitted_at", { ascending: false });

    const list = apps ?? [];
    const individualIds = [...new Set(list.map((a) => a.individual_id))];
    const reelIds = [...new Set(list.map((a) => a.reel_id).filter(Boolean))];

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
    setApplicants(
      list.map((a) => ({
        ...a,
        profile: profileById.get(a.individual_id) ?? null,
        reel: a.reel_id ? reelById.get(a.reel_id) ?? null : null,
      }))
    );
    setLoadingApplicants(false);
  }

  async function updateApplicationStatus(application, status) {
    const supabase = getSupabaseBrowserClient();
    const { error: updateError } = await supabase
      .from("job_applications")
      .update({ status })
      .eq("id", application.id);

    if (updateError) return;
    setApplicants(applicants.map((a) => (a.id === application.id ? { ...a, status } : a)));
  }

  function openVerify(application) {
    setVerifying(application);
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
        verified_by_name: manager?.name ?? null,
        verified_by_company: manager?.company ?? null,
        verified_at: new Date().toISOString(),
        verification_note: verificationNote || null,
        verified_project_title: selectedJob?.title ?? null,
      })
      .eq("id", verifying.reel_id);

    setVerifySaving(false);
    if (updateError) return;

    setApplicants(
      applicants.map((a) =>
        a.id === verifying.id ? { ...a, reel: { ...a.reel, is_verified: true } } : a
      )
    );
    setVerifying(null);
  }

  return (
    <main>
      <section style={{ paddingTop: 120 }}>
        <span className="label">Open roles</span>
        <h1 className="display" style={{ fontSize: "clamp(30px,4.5vw,48px)" }}>
          Your posted jobs
        </h1>

        <button
          type="button"
          className="cta big"
          style={{ margin: "24px 0" }}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Cancel" : "+ Post a job"}
        </button>

        {showForm && (
          <form onSubmit={handleCreate} className="authform" style={{ marginBottom: 32, maxWidth: 480 }}>
            <label className="fieldlabel" htmlFor="j-title">
              Title
            </label>
            <input
              id="j-title"
              className="field"
              placeholder="e.g. Senior React Developer"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />

            <label className="fieldlabel" htmlFor="j-desc">
              Description
            </label>
            <textarea
              id="j-desc"
              className="field"
              rows={3}
              placeholder="Describe the role, responsibilities, and what success looks like…"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />

            <label className="fieldlabel" htmlFor="j-location">
              Location
            </label>
            <input
              id="j-location"
              className="field"
              placeholder="e.g. London, UK"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label className="fieldlabel" htmlFor="j-worktype">
                  Work type
                </label>
                <select
                  id="j-worktype"
                  className="field"
                  value={form.workType}
                  onChange={(e) => setForm({ ...form, workType: e.target.value })}
                >
                  {WORK_TYPES.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="fieldlabel" htmlFor="j-emptype">
                  Employment type
                </label>
                <select
                  id="j-emptype"
                  className="field"
                  value={form.employmentType}
                  onChange={(e) => setForm({ ...form, employmentType: e.target.value })}
                >
                  {EMPLOYMENT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <label className="fieldlabel" htmlFor="j-pay">
              Pay type
            </label>
            <select
              id="j-pay"
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

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label className="fieldlabel" htmlFor="j-salary-min">
                  Salary min (USD)
                </label>
                <input
                  id="j-salary-min"
                  className="field"
                  type="number"
                  placeholder="50000"
                  value={form.salaryMin}
                  onChange={(e) => setForm({ ...form, salaryMin: e.target.value })}
                />
              </div>
              <div>
                <label className="fieldlabel" htmlFor="j-salary-max">
                  Salary max (USD)
                </label>
                <input
                  id="j-salary-max"
                  className="field"
                  type="number"
                  placeholder="80000"
                  value={form.salaryMax}
                  onChange={(e) => setForm({ ...form, salaryMax: e.target.value })}
                />
              </div>
            </div>

            <label className="fieldlabel" htmlFor="j-skills">
              Skills required (comma-separated)
            </label>
            <input
              id="j-skills"
              className="field"
              placeholder="React, Next.js, Supabase"
              value={form.skillsRequired}
              onChange={(e) => setForm({ ...form, skillsRequired: e.target.value })}
            />

            <label className="fieldlabel" htmlFor="j-duration">
              Listing closes in
            </label>
            <select
              id="j-duration"
              className="field"
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: e.target.value })}
            >
              {DURATIONS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>

            {error && <p className="msg error">{error}</p>}

            <button type="submit" className="cta big" disabled={saving}>
              {saving ? "Posting…" : "Post job"}
            </button>
          </form>
        )}

        {jobs.length === 0 ? (
          <div className="card" style={{ textAlign: "center", color: "var(--muted)" }}>
            No jobs posted yet.
          </div>
        ) : (
          <div className="grid">
            {jobs.map((job) => (
              <div key={job.id} className="card job">
                <div className="top">
                  <div>
                    <h3>{job.title}</h3>
                    <div className="co">
                      {job.work_type} · {job.employment_type}
                    </div>
                  </div>
                </div>
                <div className="chips">
                  {(job.skills_required ?? []).map((s) => (
                    <span key={s} className="chip">
                      {s}
                    </span>
                  ))}
                </div>
                <div className="foot">
                  <span className={`pill ${job.status}`}>{job.status}</span>
                  <div style={{ display: "flex", gap: 12 }}>
                    <button type="button" className="apply" onClick={() => openApplicants(job)}>
                      Applicants →
                    </button>
                    <button type="button" className="apply" onClick={() => toggleStatus(job)}>
                      {job.status === "open" ? "Close" : "Reopen"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {selectedJob && (
        <div className="modal-overlay" onClick={() => setSelectedJob(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <span className="label">Applicants</span>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>{selectedJob.title}</h2>

            {loadingApplicants ? (
              <p className="msg">Loading…</p>
            ) : applicants.length === 0 ? (
              <p className="msg">No applications yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {applicants.map((a) => (
                  <div key={a.id} className="card" style={{ padding: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                      <b>
                        {[a.profile?.first_name, a.profile?.last_name].filter(Boolean).join(" ") ||
                          a.profile?.username ||
                          "Applicant"}
                      </b>
                      <span className={`pill ${a.status}`}>{a.status}</span>
                    </div>
                    {a.cover_note && (
                      <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 6 }}>{a.cover_note}</p>
                    )}
                    {a.video_url && (
                      <a
                        href={a.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="apply"
                        style={{ display: "inline-block", marginTop: 8 }}
                      >
                        Watch pitch ↗
                      </a>
                    )}
                    {a.reel && (
                      <a
                        href={a.reel.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="apply"
                        style={{ display: "inline-block", marginTop: 8, marginLeft: a.video_url ? 12 : 0 }}
                      >
                        Watch attached reel ↗
                      </a>
                    )}
                    <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
                      {a.status !== "accepted" && (
                        <button
                          type="button"
                          className="ghost"
                          onClick={() => updateApplicationStatus(a, "accepted")}
                        >
                          Accept
                        </button>
                      )}
                      {a.status !== "rejected" && (
                        <button
                          type="button"
                          className="ghost"
                          onClick={() => updateApplicationStatus(a, "rejected")}
                        >
                          Reject
                        </button>
                      )}
                      {a.reel && !a.reel.is_verified && (
                        <button type="button" className="cta" onClick={() => openVerify(a)}>
                          ✦ Verify Reel
                        </button>
                      )}
                      {a.reel?.is_verified && <span className="msg">✦ Reel verified</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              className="ghost"
              style={{ marginTop: 20 }}
              onClick={() => setSelectedJob(null)}
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
                "Applicant"}
            </h2>
            <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.6, marginBottom: 16 }}>
              By verifying, you confirm this applicant completed real work for{" "}
              <strong style={{ color: "var(--volt)" }}>{selectedJob?.title}</strong> and this reel
              accurately demonstrates their contribution. This is permanently recorded.
            </p>
            <form onSubmit={handleVerify} className="authform">
              <label className="fieldlabel" htmlFor="job-verify-note">
                Verification note (optional)
              </label>
              <textarea
                id="job-verify-note"
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
