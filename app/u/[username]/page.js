import { notFound } from "next/navigation";
import { getPublicProfile } from "@/lib/reels";
import { getThumbnailUrl } from "@/lib/videoEmbed";
import CopyCredentialLink from "@/components/CopyCredentialLink";
import ProfileActions from "@/components/ProfileActions";

export const revalidate = 60;

export async function generateMetadata({ params }) {
  const data = await getPublicProfile(params.username);
  if (!data) return { title: "Profile not found" };
  const name =
    [data.profile.first_name, data.profile.last_name].filter(Boolean).join(" ") ||
    data.profile.username;
  return {
    title: name,
    description: data.profile.job_title
      ? `${name}, ${data.profile.job_title}. Watch their employer-verified pitch reels.`
      : `${name} on pitchNpivot.`,
  };
}

function initials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

function ReelCard({ reel }) {
  const thumb = getThumbnailUrl(reel.url);
  return (
    <div className="pcard">
      <a
        href={reel.url || "#"}
        target="_blank"
        rel="noopener noreferrer"
        className="pcard-thumb"
        style={thumb ? { backgroundImage: `url(${thumb})` } : undefined}
        aria-label={`Watch ${reel.title || "pitch"}`}
      >
        <span className="pcard-play">▶</span>
        {reel.is_verified && <span className="pcard-verified">✦ Verified</span>}
      </a>
      <div className="pcard-body">
        <h3>{reel.title || "Untitled pitch"}</h3>
        {reel.is_verified && (
          <div className="verified-badge">
            <span className="verified-star">✦</span>
            <div>
              <b>Verified by {reel.verified_by_name || "an employer"}</b>
              {reel.verified_by_company && <span> · {reel.verified_by_company}</span>}
              {reel.verified_project_title && (
                <div className="verified-project">for “{reel.verified_project_title}”</div>
              )}
              {reel.verification_note && (
                <div className="verified-note">“{reel.verification_note}”</div>
              )}
            </div>
          </div>
        )}
        <div className="chips">
          {(reel.skills ?? []).map((s) => (
            <span key={s} className="chip">
              {s}
            </span>
          ))}
        </div>
        <div className="foot">
          {reel.url && (
            <a href={reel.url} target="_blank" rel="noopener noreferrer" className="apply">
              Watch pitch ↗
            </a>
          )}
          {reel.is_verified && (
            <>
              <a href={`/verify/${reel.id}`} className="apply">
                View credential ↗
              </a>
              <CopyCredentialLink reelId={reel.id} label="Copy link" />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default async function PublicProfilePage({ params }) {
  const data = await getPublicProfile(params.username);
  if (!data) notFound();

  const { profile, reels } = data;
  const name =
    [profile.first_name, profile.last_name].filter(Boolean).join(" ") || profile.username;
  const verified = reels.filter((r) => r.is_verified);
  const unverified = reels.filter((r) => !r.is_verified);

  return (
    <main>
      <div className="profile-cover" />
      <section style={{ paddingTop: 0, marginTop: -56 }}>
        <div className="profile-head">
          <div className="profile-avatar">{initials(name)}</div>
          <div className="profile-headmeta">
            <span className="label">Talent profile</span>
            <h1 className="display" style={{ fontSize: "clamp(28px,4vw,44px)" }}>
              {name}
            </h1>
            <p style={{ color: "var(--muted)", marginTop: 6 }}>
              {[profile.job_title, profile.location].filter(Boolean).join(" · ") ||
                "pitchNpivot member"}
            </p>
            <div className="profile-stats">
              {verified.length > 0 && (
                <span className="verified-count">✦ {verified.length} employer-verified</span>
              )}
              <span className="profile-stat">{reels.length} reel{reels.length !== 1 ? "s" : ""}</span>
            </div>
          </div>
          <ProfileActions ownerId={profile.id} username={profile.username} />
        </div>

        {profile.bio && (
          <p style={{ color: "var(--muted)", marginTop: 24, maxWidth: "60ch" }}>{profile.bio}</p>
        )}
        {(profile.skills ?? []).length > 0 && (
          <div className="chips" style={{ marginTop: 16 }}>
            {profile.skills.map((s) => (
              <span key={s} className="chip">
                {s}
              </span>
            ))}
          </div>
        )}
      </section>

      {verified.length > 0 && (
        <section style={{ paddingTop: 0 }}>
          <span className="label">✦ Verified credentials</span>
          <div className="pgrid">
            {verified.map((reel) => (
              <ReelCard key={reel.id} reel={reel} />
            ))}
          </div>
        </section>
      )}

      <section style={{ paddingTop: verified.length > 0 ? 0 : undefined }}>
        <span className="label">{verified.length > 0 ? "Other pitch reels" : "Pitch reels"}</span>
        {reels.length === 0 ? (
          <div className="card" style={{ color: "var(--muted)", textAlign: "center" }}>
            No public reels yet.
          </div>
        ) : unverified.length === 0 ? (
          <div className="card" style={{ color: "var(--muted)", textAlign: "center" }}>
            All of this member&apos;s reels are verified. 🎉
          </div>
        ) : (
          <div className="pgrid">
            {unverified.map((reel) => (
              <ReelCard key={reel.id} reel={reel} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
