import Link from "next/link";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getConversations } from "@/lib/messages";

export const metadata = {
  title: "Messages",
  description: "Your conversations on pitchNpivot.",
};

export default async function MessagesPage() {
  const supabase = getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth?next=/messages");

  const conversations = await getConversations(user.id);

  return (
    <main>
      <section style={{ paddingTop: 120 }}>
        <span className="label">Inbox</span>
        <h1 className="display" style={{ fontSize: "clamp(30px,4.5vw,48px)" }}>
          Messages
        </h1>

        {conversations.length === 0 ? (
          <div className="card" style={{ color: "var(--muted)", textAlign: "center", marginTop: 24 }}>
            No conversations yet. Message someone from their profile after you connect.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 24 }}>
            {conversations.map((c) => (
              <Link
                key={c.otherId}
                href={`/messages/${c.otherId}`}
                className="card"
                style={{ padding: 16, display: "flex", alignItems: "center", gap: 12 }}
              >
                <div
                  className="msg-avatar"
                  aria-hidden="true"
                >
                  {c.name?.[0]?.toUpperCase() || "?"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <b>{c.name}</b>
                    {c.unread > 0 && <span className="notif-count" style={{ position: "static" }}>{c.unread}</span>}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "var(--muted)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {c.lastMessage}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
