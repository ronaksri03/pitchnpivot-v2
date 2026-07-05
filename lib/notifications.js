export async function notify(supabase, { userId, type, payload = {} }) {
  // Best-effort: a failed notification insert should never break the
  // action that triggered it (accepting an applicant, verifying a reel,
  // etc.), so this swallows its own errors.
  try {
    await supabase.from("notification_log").insert({ user_id: userId, type, payload, read: false });
  } catch {
    // no-op
  }
}

export async function getMyNotifications(supabase, userId, { limit = 20 } = {}) {
  const { data } = await supabase
    .from("notification_log")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}
