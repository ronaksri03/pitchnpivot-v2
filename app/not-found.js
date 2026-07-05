import Link from "next/link";

export default function NotFound() {
  return (
    <main className="nf">
      <p className="code">404</p>
      <h1 className="display">This pitch doesn&apos;t exist.</h1>
      <p>The page moved, or the link was wrong. The talent is still here, though.</p>
      <div className="row">
        <Link href="/discover" className="cta big">Watch pitches</Link>
        <Link href="/" className="ghost">Go home</Link>
      </div>
    </main>
  );
}
