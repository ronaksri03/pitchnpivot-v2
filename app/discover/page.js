import ReelCard from "@/components/ReelCard";
import { getReels } from "@/lib/reels";
import { REELS as MOCK_REELS } from "@/lib/data";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Discover talent",
  description:
    "Watch 60-second pitches from real people. Skip the resume pile.",
};

export default async function DiscoverPage() {
  const supabase = getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const reels = await getReels({ viewerId: user?.id ?? null });
  const feed = reels.length ? reels : MOCK_REELS;

  return (
    <main className="feed" aria-label="Pitch feed">
      {feed.map((reel) => (
        <div key={reel.id} className="feed-item">
          <ReelCard reel={reel} isLoggedIn={!!user} viewerId={user?.id ?? null} />
        </div>
      ))}
    </main>
  );
}
