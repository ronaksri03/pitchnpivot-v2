"use client";

import { useEffect, useRef, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { notify } from "@/lib/notifications";

export default function MessageThread({ userId, otherId, initialMessages }) {
  const [messages, setMessages] = useState(initialMessages);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  function scrollToBottom() {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(() => {
    scrollToBottom();
  }, []);

  // Light polling so new messages from the other person appear.
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    const interval = setInterval(async () => {
      const { data } = await supabase
        .from("messages")
        .select("id, sender_id, recipient_id, body, read, created_at")
        .or(
          `and(sender_id.eq.${userId},recipient_id.eq.${otherId}),and(sender_id.eq.${otherId},recipient_id.eq.${userId})`
        )
        .order("created_at", { ascending: true });
      if (data) {
        setMessages((prev) => (data.length !== prev.length ? data : prev));
      }
    }, 8000);
    return () => clearInterval(interval);
  }, [userId, otherId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  async function handleSend(e) {
    e.preventDefault();
    const text = body.trim();
    if (!text || sending) return;
    setSending(true);

    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("messages")
      .insert({ sender_id: userId, recipient_id: otherId, body: text })
      .select()
      .single();

    setSending(false);
    if (error) return;

    setMessages((prev) => [...prev, data]);
    setBody("");
    await notify(supabase, { userId: otherId, type: "new_message", payload: { from: userId } });
  }

  return (
    <div className="thread">
      <div className="thread-messages">
        {messages.length === 0 ? (
          <p className="msg" style={{ textAlign: "center", padding: 24 }}>
            No messages yet. Say hello.
          </p>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`bubble ${m.sender_id === userId ? "mine" : "theirs"}`}
            >
              {m.body}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="thread-compose">
        <input
          className="field"
          placeholder="Write a message…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <button type="submit" className="cta" disabled={sending || !body.trim()}>
          {sending ? "…" : "Send"}
        </button>
      </form>
    </div>
  );
}
