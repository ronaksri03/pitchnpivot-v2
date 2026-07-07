import { getSupabaseServerClient } from "@/lib/supabase/server";

// Resolve a set of user ids to display info, checking both profiles
// (individuals) and managers, since either role can message.
export async function resolveUsers(supabase, ids) {
  const map = new Map();
  const unique = [...new Set(ids.filter(Boolean))];
  if (!unique.length) return map;

  const [{ data: profiles }, { data: managers }] = await Promise.all([
    supabase.from("profiles").select("id, username, first_name, last_name").in("id", unique),
    supabase.from("managers").select("id, name, company").in("id", unique),
  ]);

  for (const p of profiles ?? []) {
    map.set(p.id, {
      name: [p.first_name, p.last_name].filter(Boolean).join(" ") || p.username || "Member",
      username: p.username,
    });
  }
  for (const m of managers ?? []) {
    // Managers have no /u/ profile page; leave username null.
    if (!map.has(m.id)) map.set(m.id, { name: m.name || "Manager", username: null });
  }
  return map;
}

export async function getConversations(userId) {
  const supabase = getSupabaseServerClient();

  const { data: messages } = await supabase
    .from("messages")
    .select("id, sender_id, recipient_id, body, read, created_at")
    .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
    .order("created_at", { ascending: false });

  const list = messages ?? [];
  const byOther = new Map();
  for (const m of list) {
    const otherId = m.sender_id === userId ? m.recipient_id : m.sender_id;
    if (!byOther.has(otherId)) {
      byOther.set(otherId, { otherId, lastMessage: m.body, lastAt: m.created_at, unread: 0 });
    }
    if (m.recipient_id === userId && !m.read) {
      byOther.get(otherId).unread += 1;
    }
  }

  const names = await resolveUsers(supabase, [...byOther.keys()]);
  return [...byOther.values()].map((c) => ({
    ...c,
    ...(names.get(c.otherId) || { name: "Member", username: null }),
  }));
}

export async function getConversation(userId, otherId) {
  const supabase = getSupabaseServerClient();

  const { data: messages } = await supabase
    .from("messages")
    .select("id, sender_id, recipient_id, body, read, created_at")
    .or(
      `and(sender_id.eq.${userId},recipient_id.eq.${otherId}),and(sender_id.eq.${otherId},recipient_id.eq.${userId})`
    )
    .order("created_at", { ascending: true });

  const names = await resolveUsers(supabase, [otherId]);
  return {
    messages: messages ?? [],
    other: names.get(otherId) || { name: "Member", username: null },
  };
}
