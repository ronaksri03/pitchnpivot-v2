import Link from "next/link";
import { notFound } from "next/navigation";
import { getVerifiedCredential } from "@/lib/credentials";
import CopyCredentialLink from "@/components/CopyCredentialLink";
import PrintButton from "@/components/PrintButton";

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
  const employer = reel.verified_by_name || "An employer";
  const employerLine = reel.verified_by_company
    ? `${employer}, ${reel.verified_by_company}`
    : employer;

  return (
    <div className="cert-wrap">
      <article className="cert" id="certificate">
        <div className="cert-topbar">
          <span className="cert-brand">
            pitch<em>N</em>pivot
          </span>
          {credentialId && (
            <span className={signatureValid ? "cert-authentic" : "cert-tampered"}>
              {signatureValid ? "✓ Authentic" : "⚠ Signature mismatch"}
            </span>
          )}
        </div>

        <div className="cert-seal-badge" aria-hidden="true">
          ✦
        </div>
        <span className="cert-kicker">Certificate of Verified Work</span>

        <p className="cert-intro">This certifies that</p>
        <h1 className="cert-name">{candidateName}</h1>
        {[candidate?.job_title, candidate?.location].filter(Boolean).length > 0 && (
          <p className="cert-sub">
            {[candidate?.job_title, candidate?.location].filter(Boolean).join(" · ")}
          </p>
        )}

        <p className="cert-body">
          completed and demonstrated real work
          {reel.verified_project_title ? (
            <>
              {" "}
              on the project <strong>&ldquo;{reel.verified_project_title}&rdquo;</strong>
            </>
          ) : null}
          , independently reviewed and verified by <strong>{employerLine}</strong> on the
          pitchNpivot platform.
        </p>

        {(reel.skills ?? []).length > 0 && (
          <div className="cert-skills">
            {reel.skills.map((s) => (
              <span key={s} className="chip">
                {s}
              </span>
            ))}
          </div>
        )}

        {reel.verification_note && (
          <div className="cert-note">&ldquo;{reel.verification_note}&rdquo;</div>
        )}

        <div className="cert-signatures">
          <div className="cert-sig">
            <div className="cert-sig-value">{employer}</div>
            <div className="cert-sig-label">
              Verified by{reel.verified_by_company ? ` · ${reel.verified_by_company}` : ""}
            </div>
          </div>
          <div className="cert-sig">
            <div className="cert-sig-value">{formatDate(reel.verified_at)}</div>
            <div className="cert-sig-label">Date verified</div>
          </div>
        </div>

        <p className="cert-fingerprint">
          {credentialId ? (
            <>
              Credential ID <b>{credentialId}</b> · cryptographically signed and served live from
              pitchnpivot.com. The ID is an HMAC-SHA256 signature over the verifying employer,
              project, and date above — it can&apos;t be forged without pitchNpivot&apos;s private
              key.
              {!signatureValid &&
                " This credential&apos;s signature no longer matches its contents — the fields may have been altered after signing."}
            </>
          ) : (
            "This verification predates signed credentials and carries no integrity signature."
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
          <PrintButton />
        </div>
      </article>
    </div>
  );
}
