"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const LINKS = [
  { href: "/discover", label: "Discover" },
  { href: "/jobs", label: "Jobs" },
  { href: "/lab", label: "Lab" },
];

export default function SiteNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

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
          {user ? (
            <>
              <Link href="/profile" className={pathname?.startsWith("/profile") ? "active" : ""}>
                Profile
              </Link>
              <button type="button" className="cta" onClick={handleSignOut}>
                Sign out
              </button>
            </>
          ) : (
            <Link href="/auth" className="cta">
              Start your pitch
            </Link>
          )}
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
          {user ? (
            <>
              <Link href="/profile" className={pathname?.startsWith("/profile") ? "active" : ""}>
                Profile
              </Link>
              <button type="button" className="cta" onClick={handleSignOut}>
                Sign out
              </button>
            </>
          ) : (
            <Link href="/auth" className="cta">
              Start your pitch
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
