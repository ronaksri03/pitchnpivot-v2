export const metadata = {
  title: "Privacy",
  description: "How pitchNpivot handles your data.",
};

export default function PrivacyPage() {
  return (
    <main>
      <section style={{ paddingTop: 120, maxWidth: 720 }}>
        <span className="label">Privacy</span>
        <h1 className="display" style={{ fontSize: "clamp(28px,4vw,42px)" }}>
          Privacy policy
        </h1>
        <div style={{ color: "var(--muted)", marginTop: 20, fontSize: 15, lineHeight: 1.7 }}>
          <p style={{ marginBottom: 16 }}>
            This is a placeholder privacy policy. Before launch, replace it with a
            reviewed policy covering the points below.
          </p>
          <p style={{ marginBottom: 12 }}>
            <strong style={{ color: "var(--text)" }}>What we collect.</strong> Account
            details (email, name), your profile and reels, projects and applications you
            create, and connections you make.
          </p>
          <p style={{ marginBottom: 12 }}>
            <strong style={{ color: "var(--text)" }}>Video hosting.</strong> Reels are
            hosted on third-party platforms (YouTube, Vimeo, Loom). We store only the link,
            not the video file.
          </p>
          <p style={{ marginBottom: 12 }}>
            <strong style={{ color: "var(--text)" }}>Public information.</strong> Your
            public profile, public reels, and any employer-verified credentials are
            visible to anyone with the link.
          </p>
          <p>
            <strong style={{ color: "var(--text)" }}>Contact.</strong> Questions about
            your data can be sent to the account owner.
          </p>
        </div>
      </section>
    </main>
  );
}
