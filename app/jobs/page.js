import Link from "next/link";
import { JOBS } from "@/lib/data";

export const metadata = {
  title: "Jobs that hire on proof, not paper",
  description:
    "Roles from teams that would rather watch what you can do than scan a CV.",
};

export default function JobsPage() {
  return (
    <main>
      <section style={{ paddingTop: 120 }}>
        <span className="label">Open roles</span>
        <div className="grid">
          {JOBS.map((j) => (
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
                <Link href="#" className="apply">Apply with your pitch →</Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
