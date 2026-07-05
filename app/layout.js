import "./globals.css";
import SiteNav from "@/components/SiteNav";

export const metadata = {
  metadataBase: new URL("https://www.pitchnpivot.com"),
  title: {
    default: "pitchNpivot — CVs & resumes don't go viral. You do.",
    template: "%s | pitchNpivot",
  },
  description:
    "Pitch yourself in 60 seconds of video. Get discovered by teams that hire on proof, not paper.",
  openGraph: {
    type: "website",
    siteName: "pitchNpivot",
    title: "CVs & resumes don't go viral. You do.",
    description:
      "Pitch yourself in 60 seconds of video. Get discovered by teams that hire on proof, not paper.",
  },
  twitter: {
    card: "summary_large_image",
    title: "CVs & resumes don't go viral. You do.",
    description: "Pitch yourself in 60 seconds of video.",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo:wght@800;900&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <SiteNav />
        {children}
      </body>
    </html>
  );
}
