import { getSupabaseServerClient } from "@/lib/supabase/server";

const BG_VARIANTS = 3;

function displayName(profile) {
  const full = [profile?.first_name, profile?.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();
  return full || profile?.username || "Anonymous";
}

function displayHeadline(profile) {
  return (
    [profile?.job_title, profile?.location].filter(Boolean).join(" · ") ||
    "Pitch creator"
  );
}

export async function getReels({ limit = 100 } = {}) {
  const supabase = getSupabaseServerClient();

  const [{ data: reels, error: reelsError }, { data: managers }] = await Promise.all([
    supabase
      .from("reels")
      .select("id, title, skills, url, user_id, created_at")
      .eq("visibility", "public")
      .order("created_at", { ascending: false })
      .limit(limit),
    supabase.from("managers").select("id"),
  ]);

  if (reelsError || !reels?.length) return [];

  // Manager accounts share the same id space as profiles but should never
  // show up as a candidate reel on Discover (matches v1's behavior).
  const managerIds = new Set((managers ?? []).map((m) => m.id));
  const candidateReels = reels.filter((r) => !managerIds.has(r.user_id));
  if (!candidateReels.length) return [];

  const userIds = [...new Set(candidateReels.map((r) => r.user_id).filter(Boolean))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username, first_name, last_name, job_title, location")
    .in("id", userIds);

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));

  return candidateReels.map((reel, i) => {
    const profile = profileById.get(reel.user_id);
    return {
      id: reel.id,
      name: displayName(profile),
      headline: displayHeadline(profile),
      skills: (reel.skills ?? []).slice(0, 3).map((label, idx) => ({
        label,
        hit: idx === 0,
      })),
      bg: i % BG_VARIANTS,
      videoUrl: reel.url,
      videoTitle: reel.title,
    };
  });
}

export async function getOwnReels(userId) {
  const supabase = getSupabaseServerClient();

  const { data: reels } = await supabase
    .from("reels")
    .select("id, title, skills, url, visibility, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return reels ?? [];
}
