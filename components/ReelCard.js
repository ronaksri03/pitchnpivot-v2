export default function ReelCard({ reel }) {
  return (
    <div className="phone">
      <div className={`reel-frame reel-bg-${reel.bg}`}>
        <div className="progress">
          <i />
        </div>
        <button className="playbtn" aria-label={`Play ${reel.name}'s pitch`}>
          ▶
        </button>
        <div className="reel-grad" />
        <div className="rail">
          <button aria-label="Save">♡</button>
          <button aria-label="Connect">＋</button>
          <button aria-label="Share">↗</button>
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
