import { createHash } from "crypto";
import { getSupabaseServerClient } from "@/lib/supabase/server";

// A verified reel is the "credential". This computes a deterministic
// fingerprint over the immutable verification fields so a shared credential
// page can display an integrity check: anyone can confirm the shown fields
// hash to the displayed Credential ID. The page is served live from the
// source-of-truth database, so the fingerprint detects transcription/display
// tampering rather than replacing the database + RLS as the trust anchor.
function fingerprint(reel) {
  const canonical = [
    reel.id,
    reel.verified_by ?? "",
    reel.verified_by_name ?? "",
    reel.verified_by_company ?? "",
    reel.verified_project_title ?? "",
    reel.verified_at ?? "",
  ].join("|");
  return createHash("sha256").update(canonical).digest("hex").slice(0, 16).toUpperCase();
}

export async function getVerifiedCredential(reelId) {
  const supabase = getSupabaseServerClient();

  const { data: reel } = await supabase
    .from("reels")
    .select(
      "id, title, url, skills, user_id, is_verified, verified_by, verified_by_name, verified_by_company, verified_project_title, verification_note, verified_at"
    )
    .eq("id", reelId)
    .maybeSingle();

  if (!reel || !reel.is_verified) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, first_name, last_name, job_title, location")
    .eq("id", reel.user_id)
    .maybeSingle();

  return {
    reel,
    candidate: profile,
    candidateName:
      [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") ||
      profile?.username ||
      "A pitchNpivot member",
    fingerprint: fingerprint(reel),
  };
}
