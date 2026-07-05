import { getSupabaseServerClient } from "@/lib/supabase/server";
import { signVerification } from "@/lib/verificationSignature";

export async function getVerifiedCredential(reelId) {
  const supabase = getSupabaseServerClient();

  const { data: reel } = await supabase
    .from("reels")
    .select(
      "id, title, url, skills, user_id, is_verified, verified_by, verified_by_name, verified_by_company, verified_project_title, verification_note, verified_at, verification_signature"
    )
    .eq("id", reelId)
    .maybeSingle();

  if (!reel || !reel.is_verified) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, first_name, last_name, job_title, location")
    .eq("id", reel.user_id)
    .maybeSingle();

  // Recompute the expected HMAC over the same fields the reel currently
  // carries. This is a live re-derivation against the source of truth, not
  // a cached checksum — so it only validates if the stored fields are
  // exactly what was signed at verification time, and it can't be forged
  // without the server-only signing secret.
  let signatureValid = false;
  if (reel.verification_signature) {
    try {
      const expected = signVerification({
        reelId: reel.id,
        verifiedBy: reel.verified_by,
        verifiedByName: reel.verified_by_name,
        verifiedByCompany: reel.verified_by_company,
        verifiedProjectTitle: reel.verified_project_title,
        verifiedAt: reel.verified_at,
      });
      signatureValid = expected === reel.verification_signature;
    } catch {
      signatureValid = false;
    }
  }

  return {
    reel,
    candidate: profile,
    candidateName:
      [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") ||
      profile?.username ||
      "A pitchNpivot member",
    signatureValid,
    credentialId: reel.verification_signature
      ? reel.verification_signature.slice(0, 16).toUpperCase()
      : null,
  };
}
