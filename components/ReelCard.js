"use client";

export default function ReelCard({ reel }) {
  function openVideo() {
    if (reel.videoUrl) window.open(reel.videoUrl, "_blank", "noopener,noreferrer");
  }

  async function handleShare() {
    const url = reel.videoUrl || window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: `${reel.name}'s pitch`, url });
      } catch {
        // user cancelled the share sheet — no-op
      }
    } else {
      await navigator.clipboard.writeText(url);
      window.alert("Link copied to clipboard");
    }
  }

  return (
    <div className="phone">
      <div className={`reel-frame reel-bg-${reel.bg}`}>
        {reel.isVerified && (
          <div
            className="reel-verified"
            title={
              reel.verifiedByName
                ? `Verified by ${reel.verifiedByName}${
                    reel.verifiedByCompany ? ` · ${reel.verifiedByCompany}` : ""
                  }`
                : "Employer-verified"
            }
          >
            ✦ Verified
          </div>
        )}
        <div className="progress">
          <i />
        </div>
        <button
          type="button"
          className="playbtn"
          aria-label={reel.videoUrl ? `Play ${reel.name}'s pitch` : `${reel.name}'s pitch`}
          onClick={openVideo}
          disabled={!reel.videoUrl}
        >
          ▶
        </button>
        <div className="reel-grad" />
        <div className="rail">
          <button type="button" aria-label="Save" title="Coming soon" disabled>
            ♡
          </button>
          <button type="button" aria-label="Connect" title="Coming soon" disabled>
            ＋
          </button>
          <button type="button" aria-label="Share" onClick={handleShare}>
            ↗
          </button>
        </div>
        <div className="reel-meta">
          <div className="reel-who">
            <div className="avatar" />
            <div>
              {reel.username ? (
                <a href={`/u/${reel.username}`} className="reel-who-link">
                  <b>{reel.name}</b>
                </a>
              ) : (
                <b>{reel.name}</b>
              )}
              <span>{reel.headline}</span>
              {reel.verifiedCount > 0 && (
                <div style={{ marginTop: 4 }}>
                  <span className="verified-count">✦ {reel.verifiedCount} verified</span>
                </div>
              )}
            </div>
          </div>
          <div className="chips">
            {reel.skills.map((s) => (
              <span key={s.label} className={`chip ${s.hit ? "hit" : ""}`}>
                {s.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
