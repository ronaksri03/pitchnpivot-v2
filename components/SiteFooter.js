import Link from "next/link";

const COLUMNS = [
  {
    heading: "Product",
    links: [
      { href: "/discover", label: "Discover" },
      { href: "/jobs", label: "Jobs" },
      { href: "/lab", label: "Project Lab" },
    ],
  },
  {
    heading: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/#start", label: "How it works" },
      { href: "/auth", label: "Sign in" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <Link href="/" className="logo">
            pitch<em>N</em>pivot
          </Link>
          <p>Proof-of-work video credentials for the people who build things.</p>
        </div>
        <div className="footer-cols">
          {COLUMNS.map((col) => (
            <div key={col.heading} className="footer-col">
              <span className="footer-heading">{col.heading}</span>
              {col.links.map((l) => (
                <Link key={l.href + l.label} href={l.href}>
                  {l.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} pitchNpivot</span>
        <span>Built for builders.</span>
      </div>
    </footer>
  );
}
