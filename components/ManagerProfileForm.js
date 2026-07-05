"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function ManagerProfileForm({ userId, manager }) {
  const router = useRouter();
  const [name, setName] = useState(manager?.name || "");
  const [company, setCompany] = useState(manager?.company || "");
  const [role, setRole] = useState(manager?.role || "");
  const [bio, setBio] = useState(manager?.bio || "");
  const [companyDescription, setCompanyDescription] = useState(manager?.company_description || "");
  const [companySize, setCompanySize] = useState(manager?.company_size || "");
  const [industries, setIndustries] = useState((manager?.industries || []).join(", "));
  const [location, setLocation] = useState(manager?.location || "");
  const [websiteUrl, setWebsiteUrl] = useState(manager?.website_url || "");
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
      .from("managers")
      .update({
        name,
        company,
        role,
        bio,
        company_description: companyDescription,
        company_size: companySize,
        industries: industries
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        location,
        website_url: websiteUrl,
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
      <label className="fieldlabel" htmlFor="m-name">
        Name
      </label>
      <input id="m-name" className="field" value={name} onChange={(e) => setName(e.target.value)} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label className="fieldlabel" htmlFor="m-company">
            Company
          </label>
          <input
            id="m-company"
            className="field"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </div>
        <div>
          <label className="fieldlabel" htmlFor="m-role">
            Your role
          </label>
          <input id="m-role" className="field" value={role} onChange={(e) => setRole(e.target.value)} />
        </div>
      </div>

      <label className="fieldlabel" htmlFor="m-bio">
        Bio
      </label>
      <textarea id="m-bio" className="field" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} />

      <label className="fieldlabel" htmlFor="m-company-desc">
        Company description
      </label>
      <textarea
        id="m-company-desc"
        className="field"
        rows={3}
        value={companyDescription}
        onChange={(e) => setCompanyDescription(e.target.value)}
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label className="fieldlabel" htmlFor="m-size">
            Company size
          </label>
          <input
            id="m-size"
            className="field"
            placeholder="1-10, 11-50…"
            value={companySize}
            onChange={(e) => setCompanySize(e.target.value)}
          />
        </div>
        <div>
          <label className="fieldlabel" htmlFor="m-location">
            Location
          </label>
          <input
            id="m-location"
            className="field"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
      </div>

      <label className="fieldlabel" htmlFor="m-industries">
        Industries (comma-separated)
      </label>
      <input
        id="m-industries"
        className="field"
        placeholder="Fintech, AI, Design"
        value={industries}
        onChange={(e) => setIndustries(e.target.value)}
      />

      <label className="fieldlabel" htmlFor="m-website">
        Website
      </label>
      <input
        id="m-website"
        className="field"
        placeholder="https://..."
        value={websiteUrl}
        onChange={(e) => setWebsiteUrl(e.target.value)}
      />

      {error && <p className="msg error">{error}</p>}
      {saved && !error && <p className="msg">Saved.</p>}

      <button type="submit" className="cta big" disabled={saving}>
        {saving ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
