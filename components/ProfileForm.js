"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import LocationInput from "@/components/LocationInput";

export default function ProfileForm({ userId, profile }) {
  const router = useRouter();
  const [username, setUsername] = useState(profile?.username || "");
  const [firstName, setFirstName] = useState(profile?.first_name || "");
  const [lastName, setLastName] = useState(profile?.last_name || "");
  const [jobTitle, setJobTitle] = useState(profile?.job_title || "");
  const [location, setLocation] = useState(profile?.location || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [skills, setSkills] = useState((profile?.skills || []).join(", "));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);

    const supabase = getSupabaseBrowserClient();
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        username,
        first_name: firstName,
        last_name: lastName,
        job_title: jobTitle,
        location,
        bio,
        skills: skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      })
      .eq("id", userId);

    setSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="authform">
      <label className="fieldlabel" htmlFor="username">
        Username
      </label>
      <input
        id="username"
        className="field"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label className="fieldlabel" htmlFor="firstName">
            First name
          </label>
          <input
            id="firstName"
            className="field"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>
        <div>
          <label className="fieldlabel" htmlFor="lastName">
            Last name
          </label>
          <input
            id="lastName"
            className="field"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
      </div>

      <label className="fieldlabel" htmlFor="jobTitle">
        Job title
      </label>
      <input
        id="jobTitle"
        className="field"
        placeholder="Product designer"
        value={jobTitle}
        onChange={(e) => setJobTitle(e.target.value)}
      />

      <label className="fieldlabel" htmlFor="location">
        Location
      </label>
      <LocationInput
        id="location"
        placeholder="Start typing, or pick from the list"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />

      <label className="fieldlabel" htmlFor="bio">
        Bio
      </label>
      <textarea
        id="bio"
        className="field"
        rows={3}
        value={bio}
        onChange={(e) => setBio(e.target.value)}
      />

      <label className="fieldlabel" htmlFor="skills">
        Skills (comma-separated)
      </label>
      <input
        id="skills"
        className="field"
        placeholder="Figma, Design systems, B2B SaaS"
        value={skills}
        onChange={(e) => setSkills(e.target.value)}
      />

      {error && <p className="msg error">{error}</p>}
      {saved && !error && <p className="msg">Saved.</p>}

      <button type="submit" className="cta big" disabled={saving}>
        {saving ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
