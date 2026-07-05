"use client";

import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const STATUS_OPTIONS = [
  { value: "completed", label: "Completed" },
  { value: "in-progress", label: "In progress" },
  { value: "idea", label: "Idea" },
];

const EMPTY_FORM = {
  title: "",
  description: "",
  status: "completed",
  demoLink: "",
  githubUrl: "",
  videoUrl: "",
  skills: "",
  visibility: "public",
};

function toFormValues(project) {
  return {
    title: project.title || "",
    description: project.description || "",
    status: project.status || "completed",
    demoLink: project.demo_link || "",
    githubUrl: project.github_url || "",
    videoUrl: project.video_url || "",
    skills: (project.skills || []).join(", "),
    visibility: project.visibility || "public",
  };
}

export default function PortfolioManager({ userId, initialProjects }) {
  const [projects, setProjects] = useState(initialProjects);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function startEdit(project) {
    setEditingId(project.id);
    setForm(toFormValues(project));
    setError("");
  }

  function startNew() {
    setEditingId("new");
    setForm(EMPTY_FORM);
    setError("");
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const supabase = getSupabaseBrowserClient();
    const payload = {
      title: form.title.trim(),
      description: form.description || null,
      status: form.status,
      demo_link: form.demoLink || null,
      github_url: form.githubUrl || null,
      video_url: form.videoUrl || null,
      skills: form.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      visibility: form.visibility,
    };

    if (editingId === "new") {
      const { data, error: insertError } = await supabase
        .from("individual_projects")
        .insert({ ...payload, user_id: userId })
        .select()
        .single();

      setSaving(false);
      if (insertError) {
        setError(insertError.message);
        return;
      }
      setProjects([data, ...projects]);
      cancelEdit();
    } else {
      const { data, error: updateError } = await supabase
        .from("individual_projects")
        .update(payload)
        .eq("id", editingId)
        .select()
        .single();

      setSaving(false);
      if (updateError) {
        setError(updateError.message);
        return;
      }
      setProjects(projects.map((p) => (p.id === editingId ? data : p)));
      cancelEdit();
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this project?")) return;
    const supabase = getSupabaseBrowserClient();
    const { error: deleteError } = await supabase.from("individual_projects").delete().eq("id", id);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    setProjects(projects.filter((p) => p.id !== id));
  }

  return (
    <div>
      {projects.length === 0 ? (
        <div className="card" style={{ textAlign: "center", color: "var(--muted)" }}>
          No projects yet. Add your first one to showcase your work.
        </div>
      ) : (
        <div className="grid">
          {projects.map((project) => (
            <div key={project.id} className="card job">
              <h3>{project.title}</h3>
              <div className="chips">
                <span className="pill open">{project.status}</span>
                <span className="chip">{project.visibility === "public" ? "Public" : "Private"}</span>
              </div>
              {project.description && (
                <p style={{ fontSize: 13, color: "var(--muted)" }}>{project.description}</p>
              )}
              <div className="chips">
                {(project.skills ?? []).map((s) => (
                  <span key={s} className="chip">
                    {s}
                  </span>
                ))}
              </div>
              <div className="foot">
                <div style={{ display: "flex", gap: 12 }}>
                  {project.demo_link && (
                    <a href={project.demo_link} target="_blank" rel="noopener noreferrer" className="apply">
                      Demo ↗
                    </a>
                  )}
                  {project.github_url && (
                    <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="apply">
                      Code ↗
                    </a>
                  )}
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  <button type="button" className="apply" onClick={() => startEdit(project)}>
                    Edit
                  </button>
                  <button
                    type="button"
                    className="apply"
                    style={{ color: "#ff6b6b" }}
                    onClick={() => handleDelete(project.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingId ? (
        <form onSubmit={handleSubmit} className="authform" style={{ marginTop: 24, maxWidth: 480 }}>
          <label className="fieldlabel" htmlFor="proj-title">
            Title
          </label>
          <input
            id="proj-title"
            className="field"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />

          <label className="fieldlabel" htmlFor="proj-desc">
            Description
          </label>
          <textarea
            id="proj-desc"
            className="field"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <label className="fieldlabel" htmlFor="proj-status">
            Status
          </label>
          <select
            id="proj-status"
            className="field"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          <label className="fieldlabel" htmlFor="proj-demo">
            Demo link
          </label>
          <input
            id="proj-demo"
            className="field"
            placeholder="https://..."
            value={form.demoLink}
            onChange={(e) => setForm({ ...form, demoLink: e.target.value })}
          />

          <label className="fieldlabel" htmlFor="proj-github">
            GitHub URL
          </label>
          <input
            id="proj-github"
            className="field"
            placeholder="https://github.com/you/project"
            value={form.githubUrl}
            onChange={(e) => setForm({ ...form, githubUrl: e.target.value })}
          />

          <label className="fieldlabel" htmlFor="proj-video">
            Video URL
          </label>
          <input
            id="proj-video"
            className="field"
            placeholder="https://youtube.com/watch?v=..."
            value={form.videoUrl}
            onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
          />

          <label className="fieldlabel" htmlFor="proj-skills">
            Skills (comma-separated)
          </label>
          <input
            id="proj-skills"
            className="field"
            value={form.skills}
            onChange={(e) => setForm({ ...form, skills: e.target.value })}
          />

          <label className="fieldlabel" htmlFor="proj-visibility">
            Visibility
          </label>
          <select
            id="proj-visibility"
            className="field"
            value={form.visibility}
            onChange={(e) => setForm({ ...form, visibility: e.target.value })}
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>

          {error && <p className="msg error">{error}</p>}

          <div style={{ display: "flex", gap: 12 }}>
            <button type="submit" className="cta big" disabled={saving}>
              {saving ? "Saving…" : "Save project"}
            </button>
            <button type="button" className="ghost" onClick={cancelEdit}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button type="button" className="cta big" style={{ marginTop: 24 }} onClick={startNew}>
          + Add Project
        </button>
      )}
    </div>
  );
}
