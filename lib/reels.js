import { getSupabaseServerClient } from "@/lib/supabase/server";

const BG_VARIANTS = 3;

function displayName(profile) {
  const full = [profile?.first_name, profile?.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();
  return full || profile?.username || "Anonymous";
}

function displayHeadline(profile, reel) {
  const fromProfile = [profile?.job_title, profile?.location].filter(Boolean).join(" · ");
  if (fromProfile) return fromProfile;
  // Fall back to the reel's own skills rather than a generic label.
  const fromSkills = (reel?.skills ?? []).slice(0, 2).join(" · ");
  return fromSkills || "New on pitchNpivot";
}

export async function getReels({ limit = 100, viewerId = null } = {}) {
  const supabase = getSupabaseServerClient();

  const [{ data: reels, error: reelsError }, { data: managers }] = await Promise.all([
    supabase
      .from("reels")
      .select(
        "id, title, skills, url, user_id, created_at, is_verified, verified_by_name, verified_by_company, verified_project_title, verification_note"
      )
      .eq("visibility", "public")
      .order("created_at", { ascending: false }),
    supabase.from("managers").select("id"),
  ]);

  if (reelsError || !reels?.length) return [];

  // Manager accounts share the same id space as profiles but should never
  // show up as a candidate reel on Discover (matches v1's behavior).
  const managerIds = new Set((managers ?? []).map((m) => m.id));
  const candidateReels = reels.filter((r) => !managerIds.has(r.user_id));
  if (!candidateReels.length) return [];

  // Verification-weighted ranking (patent claim 1i): reels carrying an
  // employer verification are surfaced ahead of unverified reels, with
  // recency as the secondary sort. Verified counts per user are computed so
  // the discovery card can show a credential badge (claim 6).
  const verifiedCountByUser = new Map();
  for (const reel of candidateReels) {
    if (reel.is_verified) {
      verifiedCountByUser.set(reel.user_id, (verifiedCountByUser.get(reel.user_id) ?? 0) + 1);
    }
  }

  const ranked = [...candidateReels].sort((a, b) => {
    const av = a.is_verified ? 1 : 0;
    const bv = b.is_verified ? 1 : 0;
    if (av !== bv) return bv - av;
    return new Date(b.created_at ?? 0) - new Date(a.created_at ?? 0);
  });

  const rankedForDisplay = ranked.slice(0, limit);

  const userIds = [...new Set(rankedForDisplay.map((r) => r.user_id).filter(Boolean))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username, first_name, last_name, job_title, location")
    .in("id", userIds);

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));

  // Viewer-specific state (saved / connection status) so the Save/Connect
  // buttons render correctly without a client-side round trip.
  let savedReelIds = new Set();
  let connectionByOwner = new Map();
  if (viewerId) {
    const [{ data: saved }, { data: connections }] = await Promise.all([
      supabase.from("saved_reels").select("reel_id").eq("user_id", viewerId),
      supabase
        .from("connections")
        .select("requester_id, recipient_id, status")
        .or(`requester_id.eq.${viewerId},recipient_id.eq.${viewerId}`),
    ]);
    savedReelIds = new Set((saved ?? []).map((s) => s.reel_id));
    for (const c of connections ?? []) {
      const otherId = c.requester_id === viewerId ? c.recipient_id : c.requester_id;
      const direction = c.requester_id === viewerId ? "sent" : "received";
      connectionByOwner.set(otherId, { status: c.status, direction });
    }
  }

  return rankedForDisplay.map((reel, i) => {
    const profile = profileById.get(reel.user_id);
    return {
      id: reel.id,
      ownerId: reel.user_id,
      name: displayName(profile),
      headline: displayHeadline(profile, reel),
      username: profile?.username ?? null,
      skills: (reel.skills ?? []).slice(0, 3).map((label, idx) => ({
        label,
        hit: idx === 0,
      })),
      bg: i % BG_VARIANTS,
      videoUrl: reel.url,
      videoTitle: reel.title,
      isVerified: !!reel.is_verified,
      verifiedByName: reel.verified_by_name ?? null,
      verifiedByCompany: reel.verified_by_company ?? null,
      verifiedProjectTitle: reel.verified_project_title ?? null,
      verifiedCount: verifiedCountByUser.get(reel.user_id) ?? 0,
      isSaved: savedReelIds.has(reel.id),
      connection: connectionByOwner.get(reel.user_id) ?? null,
    };
  });
}

export async function getPublicProfile(username) {
  const supabase = getSupabaseServerClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, first_name, last_name, job_title, location, bio, skills")
    .eq("username", username)
    .maybeSingle();

  if (!profile) return null;

  const { data: reels } = await supabase
    .from("reels")
    .select(
      "id, title, skills, url, is_verified, verified_by_name, verified_by_company, verified_project_title, verification_note, verified_at, created_at"
    )
    .eq("user_id", profile.id)
    .eq("visibility", "public");

  // Verified reels sorted before unverified ones (patent claim 10), recency
  // as the tiebreaker within each group.
  const sortedReels = (reels ?? []).sort((a, b) => {
    const av = a.is_verified ? 1 : 0;
    const bv = b.is_verified ? 1 : 0;
    if (av !== bv) return bv - av;
    return new Date(b.created_at ?? 0) - new Date(a.created_at ?? 0);
  });

  return { profile, reels: sortedReels };
}

export async function getOwnReels(userId) {
  const supabase = getSupabaseServerClient();

  const { data: reels } = await supabase
    .from("reels")
    .select(
      "id, title, skills, url, visibility, created_at, is_verified, verified_by_name, verified_by_company, verified_project_title, verification_note, verified_at"
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return reels ?? [];
}
