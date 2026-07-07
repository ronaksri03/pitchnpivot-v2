import { getSupabaseServerClient } from "@/lib/supabase/server";

const BASE = "https://www.pitchnpivot.com";

export default async function sitemap() {
  const now = new Date();
  const staticRoutes = ["", "/discover", "/about", "/privacy", "/terms"].map((path) => ({
    url: `${BASE}${path}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.6,
  }));

  try {
    const supabase = getSupabaseServerClient();
    const [{ data: managers }, { data: profiles }, { data: verified }] = await Promise.all([
      supabase.from("managers").select("id"),
      supabase.from("profiles").select("id, username"),
      supabase.from("reels").select("id").eq("is_verified", true),
    ]);

    const managerIds = new Set((managers ?? []).map((m) => m.id));

    const profileRoutes = (profiles ?? [])
      .filter((p) => p.username && !managerIds.has(p.id))
      .map((p) => ({
        url: `${BASE}/u/${p.username}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.8,
      }));

    const credentialRoutes = (verified ?? []).map((r) => ({
      url: `${BASE}/verify/${r.id}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    }));

    return [...staticRoutes, ...profileRoutes, ...credentialRoutes];
  } catch {
    // If the DB is unreachable at build/request time, still serve the
    // static routes rather than failing the whole sitemap.
    return staticRoutes;
  }
}
