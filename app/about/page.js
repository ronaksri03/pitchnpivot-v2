export const metadata = {
  title: "About",
  description: "What pitchNpivot is and why it exists.",
};

export default function AboutPage() {
  return (
    <main>
      <section style={{ paddingTop: 120, maxWidth: 720 }}>
        <span className="label">About</span>
        <h1 className="display" style={{ fontSize: "clamp(30px,4.5vw,48px)" }}>
          Hire on proof, not paper
        </h1>
        <div style={{ color: "var(--muted)", marginTop: 20, fontSize: 16, lineHeight: 1.7 }}>
          <p style={{ marginBottom: 16 }}>
            Résumés are self-reported and unverifiable. Endorsements are solicited from
            people who barely know your work. pitchNpivot replaces both with something
            you can&apos;t fake: a short video showing what you can actually do, backed
            by an employer who watched you do it.
          </p>
          <p style={{ marginBottom: 16 }}>
            Individuals post 60-second pitch reels tagged with their skills. Managers post
            projects and jobs. When you complete real work, the employer can verify the
            reel that demonstrates it — permanently attaching their identity, the project,
            and a timestamp to your credential. Verified talent rises to the top of
            discovery.
          </p>
          <p>
            It&apos;s a new kind of professional credential — not a degree, not a reference
            letter, but employer-endorsed proof of specific work performed.
          </p>
        </div>
      </section>
    </main>
  );
}
