"use client";

import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { notify } from "@/lib/notifications";

function PersonRow({ conn, children }) {
  const name = conn.other?.name || "pitchNpivot member";
  return (
    <div className="card" style={{ padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
      <div>
        {conn.other?.username ? (
          <a href={`/u/${conn.other.username}`} style={{ textDecoration: "none" }}>
            <b>{name}</b>
          </a>
        ) : (
          <b>{name}</b>
        )}
        {conn.other?.subtitle && (
          <div style={{ fontSize: 12, color: "var(--muted)" }}>{conn.other.subtitle}</div>
        )}
      </div>
      <div style={{ display: "flex", gap: 10 }}>{children}</div>
    </div>
  );
}

export default function ConnectionsManager({ initialIncoming, initialOutgoing, initialAccepted }) {
  const [incoming, setIncoming] = useState(initialIncoming);
  const [outgoing, setOutgoing] = useState(initialOutgoing);
  const [accepted, setAccepted] = useState(initialAccepted);

  async function respond(conn, accept) {
    const supabase = getSupabaseBrowserClient();
    if (accept) {
      const { data, error } = await supabase
        .from("connections")
        .update({ status: "accepted", responded_at: new Date().toISOString() })
        .eq("id", conn.id)
        .select()
        .single();
      if (!error) {
        setIncoming(incoming.filter((c) => c.id !== conn.id));
        setAccepted([{ ...conn, ...data }, ...accepted]);
        await notify(supabase, { userId: conn.otherId, type: "connection_accepted", payload: {} });
      }
    } else {
      const { error } = await supabase.from("connections").delete().eq("id", conn.id);
      if (!error) setIncoming(incoming.filter((c) => c.id !== conn.id));
    }
  }

  async function cancelRequest(conn) {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.from("connections").delete().eq("id", conn.id);
    if (!error) setOutgoing(outgoing.filter((c) => c.id !== conn.id));
  }

  async function removeConnection(conn) {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.from("connections").delete().eq("id", conn.id);
    if (!error) setAccepted(accepted.filter((c) => c.id !== conn.id));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
      {incoming.length > 0 && (
        <div>
          <span className="label">Requests</span>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {incoming.map((c) => (
              <PersonRow key={c.id} conn={c}>
                <button type="button" className="cta" onClick={() => respond(c, true)}>
                  Accept
                </button>
                <button type="button" className="ghost" onClick={() => respond(c, false)}>
                  Decline
                </button>
              </PersonRow>
            ))}
          </div>
        </div>
      )}

      <div>
        <span className="label">Your connections</span>
        {accepted.length === 0 ? (
          <div className="card" style={{ textAlign: "center", color: "var(--muted)" }}>
            No connections yet — connect with people from Discover.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {accepted.map((c) => (
              <PersonRow key={c.id} conn={c}>
                <button type="button" className="apply" style={{ color: "#ff6b6b" }} onClick={() => removeConnection(c)}>
                  Remove
                </button>
              </PersonRow>
            ))}
          </div>
        )}
      </div>

      {outgoing.length > 0 && (
        <div>
          <span className="label">Pending (sent)</span>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {outgoing.map((c) => (
              <PersonRow key={c.id} conn={c}>
                <button type="button" className="ghost" onClick={() => cancelRequest(c)}>
                  Cancel
                </button>
              </PersonRow>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
