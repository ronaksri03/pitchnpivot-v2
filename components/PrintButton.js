"use client";

export default function PrintButton() {
  return (
    <button type="button" className="ghost" onClick={() => window.print()}>
      Print / Save PDF
    </button>
  );
}
