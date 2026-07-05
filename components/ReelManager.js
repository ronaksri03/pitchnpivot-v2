"use client";

import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const EMPTY_FORM = { title: "", url: "", skills: "", visibility: "public" };
const MAX_REELS = 10;

function toFormValues(reel) {
  return {
    title: reel.title || "",
    url: reel.url || "",
    skills: (reel.skills || []).join(", "),
    visibility: reel.visibility || "public",
  };
}

export default function ReelManager({ userId, initialReels }) {
  const [reels, setReels] = useState(initialReels);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function startEdit(reel) {
    setEditingId(reel.id);
    setForm(toFormValues(reel));
    setError("");
  }

  function startNew() {
    if (reels.length >= MAX_REELS) {
      setError(`You can keep up to ${MAX_REELS} reels. Delete one to add another.`);
      return;
    }
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
    const skillsArray = form.skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (editingId === "new") {
      if (reels.length >= MAX_REELS) {
        setSaving(false);
        setError(`You can keep up to ${MAX_REELS} reels. Delete one to add another.`);
        return;
      }
      const { data, error: insertError } = await supabase
        .from("reels")
        .insert({
          user_id: userId,
          title: form.title,
          url: form.url,
          source: "youtube",
          skills: skillsArray,
          visibility: form.visibility,
        })
        .select()
        .single();

      setSaving(false);
      if (insertError) {
        setError(insertError.message);
        return;
      }
      setReels([data, ...reels]);
      cancelEdit();
    } else {
      const { data, error: updateError } = await supabase
        .from("reels")
        .update({
          title: form.title,
          url: form.url,
          skills: skillsArray,
          visibility: form.visibility,
        })
        .eq("id", editingId)
        .eq("user_id", userId)
        .select()
        .single();

      setSaving(false);
      if (updateError) {
        setError(updateError.message);
        return;
      }
      setReels(reels.map((r) => (r.id === editingId ? data : r)));
      cancelEdit();
    }
  }

  async function handleDelete(reelId) {
    const supabase = getSupabaseBrowserClient();
    const { error: deleteError } = await supabase
      .from("reels")
      .delete()
      .eq("id", reelId)
      .eq("user_id", userId);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    setReels(reels.filter((r) => r.id !== reelId));
  }

  return (
    <div>
      <div className="grid">
        {reels.map((reel) => (
          <div key={reel.id} className="card job">
            <h3>{reel.title || "Untitled pitch"}</h3>
            <div className="co">{reel.visibility === "public" ? "Public" : "Private"}</div>
            {reel.is_verified && (
              <div className="verified-badge">
                <span className="verified-star">✦</span>
                <div>
                  <b>Verified by {reel.verified_by_name || "an employer"}</b>
                  {reel.verified_by_company && <span> · {reel.verified_by_company}</span>}
                  {reel.verified_project_title && (
                    <div className="verified-project">for “{reel.verified_project_title}”</div>
                  )}
                </div>
              </div>
            )}
            <div className="chips">
              {(reel.skills || []).map((label) => (
                <span key={label} className="chip">
                  {label}
                </span>
              ))}
            </div>
            <div className="foot">
              <button type="button" className="apply" onClick={() => startEdit(reel)}>
                Edit
              </button>
              <button
                type="button"
                className="apply"
                style={{ color: "#ff6b6b" }}
                onClick={() => handleDelete(reel.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {editingId ? (
        <form onSubmit={handleSubmit} className="authform" style={{ marginTop: 24 }}>
          <label className="fieldlabel" htmlFor="reel-title">
            Title
          </label>
          <input
            id="reel-title"
            className="field"
            placeholder="My introduction to work"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />

          <label className="fieldlabel" htmlFor="reel-url">
            Video URL
          </label>
          <input
            id="reel-url"
            className="field"
            placeholder="https://youtube.com/watch?v=..."
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            required
          />

          <label className="fieldlabel" htmlFor="reel-skills">
            Skills (comma-separated)
          </label>
          <input
            id="reel-skills"
            className="field"
            placeholder="React, Next.js, Supabase"
            value={form.skills}
            onChange={(e) => setForm({ ...form, skills: e.target.value })}
          />

          <label className="fieldlabel" htmlFor="reel-visibility">
            Visibility
          </label>
          <select
            id="reel-visibility"
            className="field"
            value={form.visibility}
            onChange={(e) => setForm({ ...form, visibility: e.target.value })}
          >
            <option value="public">Public — visible on Discover</option>
            <option value="private">Private — only visible to you</option>
          </select>

          {error && <p className="msg error">{error}</p>}

          <div style={{ display: "flex", gap: 12 }}>
            <button type="submit" className="cta big" disabled={saving}>
              {saving ? "Saving…" : "Save pitch"}
            </button>
            <button type="button" className="ghost" onClick={cancelEdit}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div style={{ marginTop: 24 }}>
          {error && !editingId && <p className="msg error">{error}</p>}
          <button type="button" className="cta big" onClick={startNew}>
            + Post a new pitch
          </button>
          <p className="msg" style={{ marginTop: 8 }}>
            {reels.length} / {MAX_REELS} reels used
          </p>
        </div>
      )}
    </div>
  );
}
