export const metadata = {
  title: "The Lab",
  description: "Experiments, tools, and features in progress.",
};

export default function LabPage() {
  return (
    <main>
      <section style={{ paddingTop: 120, minHeight: "70dvh" }}>
        <span className="label">The Lab</span>
        <h1 className="display" style={{ fontSize: "clamp(34px,5vw,56px)" }}>
          Experiments in progress.
        </h1>
        <p style={{ color: "var(--muted)", marginTop: 16, maxWidth: "48ch" }}>
          New tools for pitching, matching, and getting discovered land here
          first. Check back soon.
        </p>
      </section>
    </main>
  );
}
