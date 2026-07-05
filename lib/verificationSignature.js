import { createHmac } from "crypto";

// Server-only. Never import this from a Client Component — it reads a
// secret that must never reach the browser.
function canonicalPayload({ reelId, verifiedBy, verifiedByName, verifiedByCompany, verifiedProjectTitle, verifiedAt }) {
  return [
    reelId,
    verifiedBy,
    verifiedByName ?? "",
    verifiedByCompany ?? "",
    verifiedProjectTitle ?? "",
    verifiedAt,
  ].join("|");
}

export function signVerification(fields) {
  const secret = process.env.CREDENTIAL_SIGNING_SECRET;
  if (!secret) throw new Error("CREDENTIAL_SIGNING_SECRET is not configured");
  return createHmac("sha256", secret).update(canonicalPayload(fields)).digest("hex");
}
