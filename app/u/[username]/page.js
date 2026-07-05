import { notFound } from "next/navigation";
import { getPublicProfile } from "@/lib/reels";

export const revalidate = 60;

export async function generateMetadata({ params }) {
  const data = await getPublicProfile(params.username);
  if (!data) return { title: "Profile not found" };
  const name =
    [data.profile.first_name, data.profile.last_name].filter(Boolean).join(" ") ||
    data.profile.username;
  return {
    title: `${name} — pitchNpivot`,
    description: data.profile.job_title
      ? `${name}, ${data.profile.job_title}. Watch their employer-verified pitch reels.`
      : `${name} on pitchNpivot.`,
  };
}

export default async function PublicProfilePage({ params }) {
  const data = await getPublicProfile(params.username);
  if (!data) notFound();

  const { profile, reels } = data;
  const name =
    [profile.first_name, profile.last_name].filter(Boolean).join(" ") || profile.username;
  const verifiedCount = reels.filter((r) => r.is_verified).length;

  return (
    <main>
      <section style={{ paddingTop: 120 }}>
        <span className="label">Talent profile</span>
        <h1 className="display" style={{ fontSize: "clamp(30px,4.5vw,48px)" }}>
          {name}
        </h1>
        <p style={{ color: "var(--muted)", marginTop: 8 }}>
          {[profile.job_title, profile.location].filter(Boolean).join(" · ")}
        </p>
        {verifiedCount > 0 && (
          <div style={{ marginTop: 12 }}>
            <span className="verified-count">✦ {verifiedCount} employer-verified</span>
          </div>
        )}
        {profile.bio && (
          <p style={{ color: "var(--muted)", marginTop: 16, maxWidth: "60ch" }}>{profile.bio}</p>
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

      <section style={{ paddingTop: 0 }}>
        <span className="label">Pitch reels</span>
        {reels.length === 0 ? (
          <div className="card" style={{ color: "var(--muted)", textAlign: "center" }}>
            No public reels yet.
          </div>
        ) : (
          <div className="grid">
            {reels.map((reel) => (
              <div key={reel.id} className="card job">
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <h3>{reel.title || "Untitled pitch"}</h3>
                  {reel.is_verified && <span className="pill accepted">✦ Verified</span>}
                </div>
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
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
