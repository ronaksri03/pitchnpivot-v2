import DiscoverFeed from "@/components/DiscoverFeed";
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
    <main>
      <section className="discover-head">
        <span className="label">Discover talent</span>
        <h1 className="display" style={{ fontSize: "clamp(30px,4.5vw,52px)" }}>
          Watch the pitch, skip the résumé
        </h1>
        <p style={{ color: "var(--muted)", marginTop: 10, maxWidth: "52ch" }}>
          {feed.length} {feed.length === 1 ? "pitch" : "pitches"} from real people.
          Employer-verified talent shows up first.
        </p>
      </section>

      <DiscoverFeed reels={feed} isLoggedIn={!!user} viewerId={user?.id ?? null} />
    </main>
  );
}
