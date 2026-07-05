"use client";

import { useState } from "react";

export default function CopyCredentialLink({ reelId, label = "Share credential" }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const url = `${window.location.origin}/verify/${reelId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this credential link:", url);
    }
  }

  return (
    <button type="button" className="ghost" onClick={handleCopy}>
      {copied ? "Link copied ✓" : label}
    </button>
  );
}
