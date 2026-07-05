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
              <b>{reel.name}</b>
              <span>{reel.headline}</span>
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
