export const metadata = {
  title: "Terms",
  description: "Terms of use for pitchNpivot.",
};

export default function TermsPage() {
  return (
    <main>
      <section style={{ paddingTop: 120, maxWidth: 720 }}>
        <span className="label">Terms</span>
        <h1 className="display" style={{ fontSize: "clamp(28px,4vw,42px)" }}>
          Terms of use
        </h1>
        <div style={{ color: "var(--muted)", marginTop: 20, fontSize: 15, lineHeight: 1.7 }}>
          <p style={{ marginBottom: 16 }}>
            This is a placeholder terms-of-use document. Replace it with a reviewed version
            before launch.
          </p>
          <p style={{ marginBottom: 12 }}>
            <strong style={{ color: "var(--text)" }}>Your content.</strong> You&apos;re
            responsible for the reels, projects, and information you post, and you confirm
            you have the right to share them.
          </p>
          <p style={{ marginBottom: 12 }}>
            <strong style={{ color: "var(--text)" }}>Verifications.</strong> Employer
            verifications are attestations by the verifying party about work they reviewed.
            They&apos;re recorded permanently and shouldn&apos;t be issued falsely.
          </p>
          <p>
            <strong style={{ color: "var(--text)" }}>Acceptable use.</strong> Don&apos;t
            misrepresent your work, impersonate others, or abuse the platform.
          </p>
        </div>
      </section>
    </main>
  );
}
