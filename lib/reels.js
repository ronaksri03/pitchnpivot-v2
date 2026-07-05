import { getSupabaseClient } from "@/lib/supabase";

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
  const supabase = getSupabaseClient();

  const { data: reels, error: reelsError } = await supabase
    .from("reels")
    .select("id, title, skills, url, user_id, created_at")
    .eq("visibility", "public")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (reelsError || !reels?.length) return [];

  const userIds = [...new Set(reels.map((r) => r.user_id).filter(Boolean))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username, first_name, last_name, job_title, location")
    .in("id", userIds);

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));

  return reels.map((reel, i) => {
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
