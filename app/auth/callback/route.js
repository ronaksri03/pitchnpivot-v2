import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const authError = searchParams.get("error_description") || searchParams.get("error");
  const next = searchParams.get("next") || "/profile";

  function toAuth(errorMsg) {
    const url = new URL("/auth", origin);
    if (errorMsg) url.searchParams.set("error", errorMsg);
    url.searchParams.set("next", next);
    return NextResponse.redirect(url);
  }

  // Supabase can hand back an error directly on the link (expired, already
  // used, etc.) — show it on the auth page rather than a blank bounce.
  if (authError) return toAuth(authError);

  const supabase = getSupabaseServerClient();
  let user = null;
  let exchangeError = null;

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    user = data?.user ?? null;
    exchangeError = error;
  } else if (tokenHash && type) {
    // token_hash confirmations work across devices (no PKCE verifier needed).
    const { data, error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    user = data?.user ?? null;
    exchangeError = error;
  } else {
    // Nothing actionable on the link.
    return toAuth("That confirmation link was invalid or already used.");
  }

  if (exchangeError || !user) {
    return toAuth(
      exchangeError?.message ||
        "We couldn't confirm your account from that link. Try signing in, or request a new link."
    );
  }

  if (!user.user_metadata?.account_type) {
    // OAuth signups never went through the role-select form — send them to
    // finish setting up their account before landing anywhere else.
    const completeUrl = new URL("/auth/complete", origin);
    completeUrl.searchParams.set("next", next);
    return NextResponse.redirect(completeUrl);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
