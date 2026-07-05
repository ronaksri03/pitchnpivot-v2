import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "pitchNpivot — CVs & resumes don't go viral. You do.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex",
          flexDirection: "column", justifyContent: "space-between",
          padding: 72, background: "#0B0B0F", color: "#F5F5F7",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 36, fontWeight: 700 }}>
          pitch<span style={{ color: "#FFD100" }}>N</span>pivot
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 84, fontWeight: 800, lineHeight: 1.05 }}>
          <span style={{ color: "#8A8A94" }}>CVs don&apos;t go viral.</span>
          <span style={{ color: "#FFD100" }}>You do.</span>
        </div>
        <div style={{ display: "flex", fontSize: 28, color: "#8A8A94" }}>
          Pitch yourself in 60 seconds of video.
        </div>
      </div>
    ),
    { ...size }
  );
}
