import ReelCard from "@/components/ReelCard";
import { REELS } from "@/lib/data";

export const metadata = {
  title: "Discover talent",
  description:
    "Watch 60-second pitches from real people. Skip the resume pile.",
};

export default function DiscoverPage() {
  return (
    <main className="feed" aria-label="Pitch feed">
      {REELS.map((reel) => (
        <div key={reel.id} className="feed-item">
          <ReelCard reel={reel} />
        </div>
      ))}
    </main>
  );
}
