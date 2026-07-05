"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/profile";

  const [mode, setMode] = useState("signin");
  const [role, setRole] = useState("individual");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [company, setCompany] = useState("");
  const [managerRole, setManagerRole] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const isSignup = mode === "signup";
  const isManager = role === "manager";

  async function handleGitHub() {
    setError("");
    const supabase = getSupabaseBrowserClient();
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    if (oauthError) setError(oauthError.message);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setNotice("");
    setLoading(true);

    const supabase = getSupabaseBrowserClient();

    try {
      if (isSignup) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { account_type: role } },
        });
        if (signUpError) throw signUpError;

        if (data.session) {
          // Only write the profile/manager row once we actually have an
          // authenticated session — RLS requires auth.uid() = id, which
          // isn't set yet if email confirmation is pending (signUp()
          // returns a user with no session in that case). The unconfirmed
          // case is self-healed on first real sign-in instead.
          if (isManager) {
            await supabase.from("managers").upsert({
              id: data.user.id,
              name: `${firstName} ${lastName}`.trim(),
              company: company || null,
              role: managerRole || null,
              created_at: new Date().toISOString(),
            });
          } else {
            await supabase.from("profiles").upsert({
              id: data.user.id,
              username: email.split("@")[0],
              first_name: firstName,
              last_name: lastName,
              role: "individual",
            });
          }
          router.push(next);
          router.refresh();
        } else if (data.user && data.user.identities?.length === 0) {
          // Supabase returns a user with no identities (and no error) when
          // the email is already registered, to avoid leaking which emails
          // exist. Surface that plainly instead of the generic notice.
          setError("This email is already registered. Try signing in instead.");
          setMode("signin");
        } else {
          setNotice("Check your email to confirm your account, then sign in.");
          setMode("signin");
        }
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;

        const accountType = data.user?.user_metadata?.account_type;
        if (accountType && accountType !== role) {
          await supabase.auth.signOut();
          throw new Error(
            accountType === "manager"
              ? "This is a manager account. Please select 'Manager' to sign in."
              : "This is an individual account. Please select 'Individual' to sign in."
          );
        }

        router.push(next);
        router.refresh();
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <section style={{ paddingTop: 140, maxWidth: 420 }}>
        <span className="label">Welcome back</span>
        <h1 className="display" style={{ fontSize: "clamp(28px,4vw,40px)", marginBottom: 24 }}>
          {mode === "signin" ? "Sign in" : "Create your account"}
        </h1>

        <div className="tabs">
          <button
            type="button"
            className={`tab ${mode === "signin" ? "active" : ""}`}
            onClick={() => setMode("signin")}
          >
            Sign in
          </button>
          <button
            type="button"
            className={`tab ${mode === "signup" ? "active" : ""}`}
            onClick={() => setMode("signup")}
          >
            Sign up
          </button>
        </div>

        <button type="button" className="ghost oauth-btn" onClick={handleGitHub}>
          <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38
              0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01
              1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95
              0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.5 7.5 0 0 1 4 0c1.53-1.04 2.2-.82
              2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54
              1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
          </svg>
          Continue with GitHub
        </button>
        <div className="auth-divider">
          <span>or</span>
        </div>

        <form onSubmit={handleSubmit} className="authform">
          <label className="fieldlabel">
            {isSignup ? "I am a" : "Sign in as"}
          </label>
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

          {isSignup && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label className="fieldlabel" htmlFor="firstName">
                  First name
                </label>
                <input
                  id="firstName"
                  className="field"
                  placeholder="Alex"
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
                  placeholder="Chen"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          {isSignup && isManager && (
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

          <label className="fieldlabel" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="field"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label className="fieldlabel" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="field"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />

          {error && <p className="msg error">{error}</p>}
          {notice && <p className="msg">{notice}</p>}

          <button type="submit" className="cta big" disabled={loading} style={{ width: "100%" }}>
            {loading
              ? "Please wait…"
              : isSignup
              ? `Create ${isManager ? "manager" : "individual"} account →`
              : "Sign in →"}
          </button>
        </form>

        <p className="switchmode">
          {mode === "signin" ? (
            <>
              Don&apos;t have an account?{" "}
              <button type="button" onClick={() => setMode("signup")}>
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button type="button" onClick={() => setMode("signin")}>
                Sign in
              </button>
            </>
          )}
        </p>
      </section>
    </main>
  );
}
