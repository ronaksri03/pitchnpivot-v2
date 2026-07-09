import { createHmac } from "crypto";

// Server-only. Never import this from a Client Component — it reads a
// secret that must never reach the browser.

// Normalize the timestamp before signing so the signature survives the
// round-trip through Postgres. At write time verifiedAt is a JS ISO string
// ("…789Z"); read back from a timestamptz column it comes as "…789+00:00".
// Canonicalizing both to the same ISO form keeps the signature stable.
function normalizeTimestamp(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  return Number.isNaN(d.getTime()) ? String(ts) : d.toISOString();
}

function canonicalPayload({ reelId, verifiedBy, verifiedByName, verifiedByCompany, verifiedProjectTitle, verifiedAt }) {
  return [
    reelId,
    verifiedBy,
    verifiedByName ?? "",
    verifiedByCompany ?? "",
    verifiedProjectTitle ?? "",
    normalizeTimestamp(verifiedAt),
  ].join("|");
}

export function signVerification(fields) {
  const secret = process.env.CREDENTIAL_SIGNING_SECRET;
  if (!secret) throw new Error("CREDENTIAL_SIGNING_SECRET is not configured");
  return createHmac("sha256", secret).update(canonicalPayload(fields)).digest("hex");
}
