"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { notify } from "@/lib/notifications";

export default function ProfileActions({ ownerId, username }) {
  const router = useRouter();
  const [viewerId, setViewerId] = useState(null);
  const [ready, setReady] = useState(false);
  const [connection, setConnection] = useState(null); // {status, direction} | null
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    supabase.auth.getUser().then(async ({ data }) => {
      const uid = data.user?.id ?? null;
      setViewerId(uid);
      if (uid && uid !== ownerId) {
        const { data: rows } = await supabase
          .from("connections")
          .select("requester_id, recipient_id, status")
          .or(`and(requester_id.eq.${uid},recipient_id.eq.${ownerId}),and(requester_id.eq.${ownerId},recipient_id.eq.${uid})`);
        const c = rows?.[0];
        if (c) {
          setConnection({
            status: c.status,
            direction: c.requester_id === uid ? "sent" : "received",
          });
        }
      }
      setReady(true);
    });
  }, [ownerId]);

  async function handleConnect() {
    if (!viewerId) {
      router.push(`/auth?next=${encodeURIComponent(`/u/${username}`)}`);
      return;
    }
    if (busy || connection) {
      if (connection?.direction === "received") router.push("/connections");
      return;
    }
    setBusy(true);
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase
      .from("connections")
      .insert({ requester_id: viewerId, recipient_id: ownerId, status: "pending" });
    if (!error) {
      setConnection({ status: "pending", direction: "sent" });
      await notify(supabase, { userId: ownerId, type: "connection_request", payload: {} });
    }
    setBusy(false);
  }

  async function handleCopy() {
    const url = `${window.location.origin}/u/${username}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this profile link:", url);
    }
  }

  const isOwner = ready && viewerId === ownerId;

  let connectLabel = "Connect";
  if (connection?.status === "accepted") connectLabel = "Connected ✓";
  else if (connection?.direction === "sent") connectLabel = "Requested";
  else if (connection?.direction === "received") connectLabel = "Respond";

  return (
    <div className="profile-actions">
      {isOwner ? (
        <a href="/profile" className="cta big">
          Edit your profile
        </a>
      ) : (
        <button
          type="button"
          className="cta big"
          onClick={handleConnect}
          disabled={busy || connection?.status === "accepted" || connection?.direction === "sent"}
        >
          {connectLabel}
        </button>
      )}
      <button type="button" className="ghost" onClick={handleCopy}>
        {copied ? "Link copied ✓" : "Share profile"}
      </button>
    </div>
  );
}
