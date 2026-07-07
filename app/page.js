import Link from "next/link";
import ReelCard from "@/components/ReelCard";
import { getReels } from "@/lib/reels";
import { REELS as MOCK_REELS, JOBS } from "@/lib/data";

export const revalidate = 60;

export default async function HomePage() {
  const reels = await getReels({ limit: 1 });
  const heroReel = reels[0] ?? MOCK_REELS[0];

  return (
    <main>
      <section className="hero" id="start">
        <div>
          <h1 className="display">
            <span className="dim">CVs don&apos;t<br />go viral.</span>
            <br />
            <span className="you">You do.</span>
          </h1>
          <p>
            Pitch yourself in 60 seconds of video. Get discovered by teams
            that hire on proof, not paper.
          </p>
          <div className="actions">
            <Link href="/auth?next=/profile" className="cta big">Record your pitch</Link>
            <Link href="/discover" className="ghost">Watch pitches →</Link>
          </div>
        </div>
        <ReelCard reel={heroReel} />
      </section>

      <section className="howitworks">
        <span className="label">How it works</span>
        <div className="steps">
          <div className="step">
            <span className="step-num">1</span>
            <h3>Record a 60-second pitch</h3>
            <p>Show what you can do on camera — no polished résumé required.</p>
          </div>
          <div className="step">
            <span className="step-num">2</span>
            <h3>Do real work, get verified</h3>
            <p>Complete a project and the employer verifies your reel — a proof-of-work credential nobody can fake.</p>
          </div>
          <div className="step">
            <span className="step-num">3</span>
            <h3>Get discovered</h3>
            <p>Verified talent ranks first in discovery. Teams reach out based on proof, not paper.</p>
          </div>
        </div>
      </section>

      <section>
        <span className="label">Open roles</span>
        <div className="grid">
          {JOBS.slice(0, 3).map((j) => (
            <div key={j.id} className="card job">
              <div className="top">
                <div className="jlogo">{j.initial}</div>
                <div>
                  <h3>{j.title}</h3>
                  <div className="co">{j.company} · {j.location}</div>
                </div>
              </div>
              <div className="chips">
                {j.skills.map((s) => (
                  <span key={s.label} className={`chip ${s.hit ? "hit" : ""}`}>{s.label}</span>
                ))}
              </div>
              <div className="foot">
                <span>{j.salary}</span>
                <Link href="/jobs" className="apply">Apply with your pitch →</Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
