import ReelCard from "@/components/ReelCard";
import { getReels } from "@/lib/reels";
import { REELS as MOCK_REELS } from "@/lib/data";

export const metadata = {
  title: "Discover talent",
  description:
    "Watch 60-second pitches from real people. Skip the resume pile.",
};

export const revalidate = 60;

export default async function DiscoverPage() {
  const reels = await getReels();
  const feed = reels.length ? reels : MOCK_REELS;

  return (
    <main className="feed" aria-label="Pitch feed">
      {feed.map((reel) => (
        <div key={reel.id} className="feed-item">
          <ReelCard reel={reel} />
        </div>
      ))}
    </main>
  );
}
