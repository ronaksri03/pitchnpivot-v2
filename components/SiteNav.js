"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/discover", label: "Discover" },
  { href: "/jobs", label: "Jobs" },
  { href: "/lab", label: "Lab" },
];

export default function SiteNav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className={`nav-shell ${scrolled || open ? "scrolled" : ""}`}>
      <div className="nav-inner">
        <Link href="/" className="logo">
          pitch<em>N</em>pivot
        </Link>
        <div className="navlinks">
          {LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={pathname?.startsWith(href) ? "active" : ""}
            >
              {label}
            </Link>
          ))}
          <Link href="/#start" className="cta">
            Start your pitch
          </Link>
        </div>
        <button
          type="button"
          className="menu-btn"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen(!open)}
        >
          {open ? "✕" : "☰"}
        </button>
      </div>
      {open && (
        <div className="mobile-menu">
          {LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={pathname?.startsWith(href) ? "active" : ""}
            >
              {label}
            </Link>
          ))}
          <Link href="/#start" className="cta">
            Start your pitch
          </Link>
        </div>
      )}
    </header>
  );
}
