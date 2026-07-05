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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setNotice("");
    setLoading(true);

    const supabase = getSupabaseBrowserClient();

    try {
      if (mode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;

        if (data.session) {
          // Only write the profile once we actually have an authenticated
          // session — RLS requires auth.uid() = id, which isn't set yet if
          // email confirmation is pending (signUp() returns a user with no
          // session in that case). The unconfirmed case is self-healed by
          // /profile on first real sign-in instead.
          await supabase.from("profiles").upsert({
            id: data.user.id,
            username: email.split("@")[0],
            role,
          });
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
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
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

        <form onSubmit={handleSubmit} className="authform">
          <label className="fieldlabel">
            {mode === "signup" ? "Sign up as" : "Sign in as"}
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
              className="roleopt disabled"
              disabled
              title="Manager accounts are coming soon"
            >
              Manager — hiring or posting projects
              <span className="soon">Coming soon</span>
            </button>
          </div>

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
            {loading ? "Please wait…" : mode === "signin" ? "Sign in →" : "Sign up →"}
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
