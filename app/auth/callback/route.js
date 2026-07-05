import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/profile";

  if (!code) {
    return NextResponse.redirect(`${origin}${next}`);
  }

  const supabase = getSupabaseServerClient();
  const { data } = await supabase.auth.exchangeCodeForSession(code);
  const user = data?.user;

  if (user && !user.user_metadata?.account_type) {
    // OAuth signups never went through the role-select form — send them to
    // finish setting up their account before landing anywhere else.
    const completeUrl = new URL("/auth/complete", origin);
    completeUrl.searchParams.set("next", next);
    return NextResponse.redirect(completeUrl);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
