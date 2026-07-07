import Link from "next/link";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getConversation } from "@/lib/messages";
import MessageThread from "@/components/MessageThread";

export const metadata = {
  title: "Conversation",
};

export default async function ThreadPage({ params }) {
  const supabase = getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/auth?next=/messages/${params.otherId}`);
  if (params.otherId === user.id) redirect("/messages");

  const { messages, other } = await getConversation(user.id, params.otherId);

  // Mark messages from the other person as read on open.
  await supabase
    .from("messages")
    .update({ read: true })
    .eq("recipient_id", user.id)
    .eq("sender_id", params.otherId)
    .eq("read", false);

  return (
    <main>
      <section style={{ paddingTop: 110, maxWidth: 720 }}>
        <Link href="/messages" className="apply" style={{ display: "inline-block", marginBottom: 16 }}>
          ← All messages
        </Link>
        <div className="thread-head">
          <div className="msg-avatar">{other.name?.[0]?.toUpperCase() || "?"}</div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700 }}>{other.name}</h1>
            {other.username && (
              <Link href={`/u/${other.username}`} className="apply" style={{ fontSize: 13 }}>
                View profile ↗
              </Link>
            )}
          </div>
        </div>

        <MessageThread
          userId={user.id}
          otherId={params.otherId}
          initialMessages={messages}
        />
      </section>
    </main>
  );
}
