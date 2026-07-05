"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function CompleteAccountForm({ next, suggestedFirstName, suggestedLastName, email }) {
  const router = useRouter();
  const [role, setRole] = useState("individual");
  const [firstName, setFirstName] = useState(suggestedFirstName);
  const [lastName, setLastName] = useState(suggestedLastName);
  const [company, setCompany] = useState("");
  const [managerRole, setManagerRole] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isManager = role === "manager";

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const supabase = getSupabaseBrowserClient();

    const { data: userData, error: updateUserError } = await supabase.auth.updateUser({
      data: { account_type: role },
    });
    if (updateUserError) {
      setSaving(false);
      setError(updateUserError.message);
      return;
    }

    const userId = userData.user.id;
    const { error: rowError } = isManager
      ? await supabase.from("managers").upsert({
          id: userId,
          name: `${firstName} ${lastName}`.trim(),
          company: company || null,
          role: managerRole || null,
          created_at: new Date().toISOString(),
        })
      : await supabase.from("profiles").upsert({
          id: userId,
          username: email.split("@")[0],
          first_name: firstName,
          last_name: lastName,
          role: "individual",
        });

    setSaving(false);
    if (rowError) {
      setError(rowError.message);
      return;
    }

    router.push(next);
    router.refresh();
  }

  return (
    <main>
      <section style={{ paddingTop: 140, maxWidth: 420 }}>
        <span className="label">Almost there</span>
        <h1 className="display" style={{ fontSize: "clamp(28px,4vw,40px)", marginBottom: 8 }}>
          Finish setting up
        </h1>
        <p style={{ color: "var(--muted)", marginBottom: 24 }}>{email}</p>

        <form onSubmit={handleSubmit} className="authform">
          <label className="fieldlabel">I am a</label>
          <div className="roleselect">
            <button
              type="button"
              className={`roleopt ${role === "individual" ? "active" : ""}`}
              onClick={() => setRole("individual")}
            >
              Individual — looking for work / projects
            </button>
            <button
              type="button"
              className={`roleopt ${role === "manager" ? "active" : ""}`}
              onClick={() => setRole("manager")}
            >
              Manager — hiring or posting projects
            </button>
          </div>

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
                required
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
                required
              />
            </div>
          </div>

          {isManager && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label className="fieldlabel" htmlFor="company">
                  Company
                </label>
                <input
                  id="company"
                  className="field"
                  placeholder="Acme Inc."
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
              </div>
              <div>
                <label className="fieldlabel" htmlFor="managerRole">
                  Your role
                </label>
                <input
                  id="managerRole"
                  className="field"
                  placeholder="CTO, Founder…"
                  value={managerRole}
                  onChange={(e) => setManagerRole(e.target.value)}
                />
              </div>
            </div>
          )}

          {error && <p className="msg error">{error}</p>}

          <button type="submit" className="cta big" disabled={saving}>
            {saving ? "Saving…" : "Continue →"}
          </button>
        </form>
      </section>
    </main>
  );
}
