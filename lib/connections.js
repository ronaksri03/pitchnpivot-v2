import { getSupabaseServerClient } from "@/lib/supabase/server";

async function displayInfoFor(ids, supabase) {
  const map = new Map();
  if (!ids.length) return map;

  const [{ data: profiles }, { data: managers }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, username, first_name, last_name, job_title")
      .in("id", ids),
    supabase.from("managers").select("id, name, company").in("id", ids),
  ]);

  for (const p of profiles ?? []) {
    map.set(p.id, {
      name: [p.first_name, p.last_name].filter(Boolean).join(" ") || p.username,
      subtitle: p.job_title,
      username: p.username,
    });
  }
  for (const m of managers ?? []) {
    map.set(m.id, { name: m.name, subtitle: m.company, username: null });
  }
  return map;
}

export async function getMyConnections(userId) {
  const supabase = getSupabaseServerClient();

  const { data: connections } = await supabase
    .from("connections")
    .select("*")
    .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`)
    .order("created_at", { ascending: false });

  const list = connections ?? [];
  const otherIds = [
    ...new Set(list.map((c) => (c.requester_id === userId ? c.recipient_id : c.requester_id))),
  ];
  const infoById = await displayInfoFor(otherIds, supabase);

  const enriched = list.map((c) => {
    const otherId = c.requester_id === userId ? c.recipient_id : c.requester_id;
    const direction = c.requester_id === userId ? "sent" : "received";
    return { ...c, otherId, direction, other: infoById.get(otherId) ?? null };
  });

  return {
    incoming: enriched.filter((c) => c.direction === "received" && c.status === "pending"),
    outgoing: enriched.filter((c) => c.direction === "sent" && c.status === "pending"),
    accepted: enriched.filter((c) => c.status === "accepted"),
  };
}
