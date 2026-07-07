"use client";

import { useMemo, useState } from "react";
import ReelCard from "@/components/ReelCard";

export default function DiscoverFeed({ reels, isLoggedIn, viewerId }) {
  const [query, setQuery] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [activeSkill, setActiveSkill] = useState(null);

  // Skill chips derived from the loaded feed, most common first.
  const topSkills = useMemo(() => {
    const counts = new Map();
    for (const r of reels) {
      for (const s of r.skills ?? []) {
        const label = s.label;
        counts.set(label, (counts.get(label) ?? 0) + 1);
      }
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([label]) => label);
  }, [reels]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return reels.filter((r) => {
      if (verifiedOnly && !r.isVerified) return false;
      if (activeSkill && !(r.skills ?? []).some((s) => s.label === activeSkill)) return false;
      if (q) {
        const haystack = [
          r.name,
          r.headline,
          ...(r.skills ?? []).map((s) => s.label),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [reels, query, verifiedOnly, activeSkill]);

  return (
    <>
      <div className="discover-filters">
        <input
          type="search"
          className="field discover-search"
          placeholder="Search by name, skill, or headline…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          type="button"
          className={`filter-toggle ${verifiedOnly ? "active" : ""}`}
          onClick={() => setVerifiedOnly((v) => !v)}
        >
          ✦ Verified only
        </button>
      </div>

      {topSkills.length > 0 && (
        <div className="discover-skills">
          <button
            type="button"
            className={`chip ${!activeSkill ? "hit" : ""}`}
            onClick={() => setActiveSkill(null)}
          >
            All
          </button>
          {topSkills.map((skill) => (
            <button
              type="button"
              key={skill}
              className={`chip ${activeSkill === skill ? "hit" : ""}`}
              onClick={() => setActiveSkill((s) => (s === skill ? null : skill))}
            >
              {skill}
            </button>
          ))}
        </div>
      )}

      <div className="feed" aria-label="Pitch feed">
        {filtered.length === 0 ? (
          <p className="discover-empty">No pitches match your filters.</p>
        ) : (
          filtered.map((reel) => (
            <div key={reel.id} className="feed-item">
              <ReelCard reel={reel} isLoggedIn={isLoggedIn} viewerId={viewerId} />
            </div>
          ))
        )}
      </div>
    </>
  );
}
