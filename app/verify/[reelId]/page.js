import Link from "next/link";
import { notFound } from "next/navigation";
import { getVerifiedCredential } from "@/lib/credentials";
import CopyCredentialLink from "@/components/CopyCredentialLink";

export const revalidate = 60;

function formatDate(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export async function generateMetadata({ params }) {
  const credential = await getVerifiedCredential(params.reelId);
  if (!credential) return { title: "Credential not found" };

  const employer = [credential.reel.verified_by_name, credential.reel.verified_by_company]
    .filter(Boolean)
    .join(", ");
  return {
    title: `Verified credential — ${credential.candidateName}`,
    description: `${credential.candidateName}'s work${
      credential.reel.verified_project_title ? ` on "${credential.reel.verified_project_title}"` : ""
    } was verified${employer ? ` by ${employer}` : ""} on pitchNpivot.`,
  };
}

export default async function VerifyCredentialPage({ params }) {
  const credential = await getVerifiedCredential(params.reelId);
  if (!credential) notFound();

  const { reel, candidate, candidateName, signatureValid, credentialId } = credential;

  return (
    <div className="cert-wrap">
      <div className="cert">
        <span className="cert-seal">✦ Verified Proof of Work</span>
        {credentialId && (
          <span
            className={signatureValid ? "verified-count" : "pill rejected"}
            style={{ marginLeft: 10 }}
          >
            {signatureValid ? "✓ Signature valid" : "⚠ Signature mismatch"}
          </span>
        )}

        <h1>{candidateName}</h1>
        <p className="cert-sub">
          {[candidate?.job_title, candidate?.location].filter(Boolean).join(" · ") ||
            "pitchNpivot member"}
        </p>

        <div style={{ marginTop: 24 }}>
          <div className="cert-row">
            <span className="k">Verified reel</span>
            <span className="v">{reel.title || "Untitled pitch"}</span>
          </div>
          <div className="cert-row">
            <span className="k">Verified by</span>
            <span className="v">
              {reel.verified_by_name || "An employer"}
              {reel.verified_by_company ? ` · ${reel.verified_by_company}` : ""}
            </span>
          </div>
          {reel.verified_project_title && (
            <div className="cert-row">
              <span className="k">Project</span>
              <span className="v">{reel.verified_project_title}</span>
            </div>
          )}
          <div className="cert-row">
            <span className="k">Date verified</span>
            <span className="v">{formatDate(reel.verified_at)}</span>
          </div>
          {(reel.skills ?? []).length > 0 && (
            <div className="cert-row">
              <span className="k">Skills demonstrated</span>
              <span className="v">{reel.skills.join(", ")}</span>
            </div>
          )}
        </div>

        {reel.verification_note && (
          <div className="cert-note">“{reel.verification_note}”</div>
        )}

        <p className="cert-fingerprint">
          Credential ID: <b>{credentialId ?? "unsigned"}</b>
          <br />
          {credentialId ? (
            <>
              This record is served live from pitchnpivot.com. The ID is an HMAC-SHA256 signature
              computed server-side at verification time over the verifying employer, project, and
              timestamp shown above, using a secret key never exposed to the browser or database
              clients — it cannot be reproduced without that key, so it can&apos;t be forged even
              by someone with direct database access.
              {!signatureValid &&
                " The recomputed signature no longer matches what's stored — the verification fields shown above may have been altered after signing."}
            </>
          ) : (
            "This verification predates signed credentials and has no integrity signature."
          )}
        </p>

        <div className="cert-actions">
          {reel.url && (
            <a href={reel.url} target="_blank" rel="noopener noreferrer" className="cta big">
              Watch the reel ↗
            </a>
          )}
          {candidate?.username && (
            <Link href={`/u/${candidate.username}`} className="ghost">
              View full profile
            </Link>
          )}
          <CopyCredentialLink reelId={reel.id} />
        </div>
      </div>
    </div>
  );
}
