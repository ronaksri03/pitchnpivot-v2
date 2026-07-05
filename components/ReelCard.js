"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { getEmbedUrl, getThumbnailUrl } from "@/lib/videoEmbed";
import { notify } from "@/lib/notifications";

const CONNECT_LABELS = {
  sent: "Requested",
  received: "Respond",
  accepted: "Connected",
};

export default function ReelCard({ reel, isLoggedIn = false, viewerId = null }) {
  const router = useRouter();
  const [saved, setSaved] = useState(!!reel.isSaved);
  const [connection, setConnection] = useState(reel.connection);
  const [busy, setBusy] = useState(false);
  const [playing, setPlaying] = useState(false);

  const embedUrl = getEmbedUrl(reel.videoUrl);
  const thumbnailUrl = getThumbnailUrl(reel.videoUrl);

  function requireAuth() {
    router.push(`/auth?next=${encodeURIComponent("/discover")}`);
  }

  function openVideo() {
    if (!reel.videoUrl) return;
    if (embedUrl) {
      setPlaying(true);
    } else {
      window.open(reel.videoUrl, "_blank", "noopener,noreferrer");
    }
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

  async function handleSave() {
    if (!isLoggedIn) return requireAuth();
    if (busy) return;
    setBusy(true);
    const supabase = getSupabaseBrowserClient();

    if (saved) {
      const { error } = await supabase
        .from("saved_reels")
        .delete()
        .eq("user_id", viewerId)
        .eq("reel_id", reel.id);
      if (!error) setSaved(false);
    } else {
      const { error } = await supabase
        .from("saved_reels")
        .insert({ user_id: viewerId, reel_id: reel.id });
      if (!error) setSaved(true);
    }
    setBusy(false);
  }

  async function handleConnect() {
    if (!isLoggedIn) return requireAuth();
    if (busy || !reel.ownerId || reel.ownerId === viewerId) return;

    if (connection?.status === "pending" && connection.direction === "received") {
      // Viewer already has an incoming request from this person — go accept
      // it from their connections list rather than guessing here.
      router.push("/connections");
      return;
    }
    if (connection) return; // already sent or accepted, nothing to do

    setBusy(true);
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase
      .from("connections")
      .insert({ requester_id: viewerId, recipient_id: reel.ownerId, status: "pending" });
    if (!error) {
      setConnection({ status: "pending", direction: "sent" });
      await notify(supabase, { userId: reel.ownerId, type: "connection_request", payload: {} });
    }
    setBusy(false);
  }

  const connectLabel = connection
    ? connection.status === "accepted"
      ? CONNECT_LABELS.accepted
      : CONNECT_LABELS[connection.direction]
    : null;

  return (
    <div className="phone">
      <div
        className={`reel-frame reel-bg-${reel.bg}`}
        style={
          !playing && thumbnailUrl
            ? { backgroundImage: `url(${thumbnailUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
            : undefined
        }
      >
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

        {playing && embedUrl ? (
          <>
            <iframe
              className="reel-video-frame"
              src={`${embedUrl}?autoplay=1`}
              title={`${reel.name}'s pitch`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            <button
              type="button"
              className="reel-video-close"
              aria-label="Close video"
              onClick={() => setPlaying(false)}
            >
              ✕
            </button>
          </>
        ) : (
          <>
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
          </>
        )}
        <div className="rail">
          <button
            type="button"
            aria-label="Save"
            title={saved ? "Saved" : "Save"}
            className={saved ? "rail-active" : ""}
            onClick={handleSave}
          >
            {saved ? "♥" : "♡"}
          </button>
          <button
            type="button"
            aria-label="Connect"
            title={connectLabel || "Connect"}
            className={connection ? "rail-active" : ""}
            onClick={handleConnect}
            disabled={connection?.status === "accepted" || (connection?.direction === "sent")}
          >
            {connection ? "✓" : "＋"}
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
