export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/auth",
        "/api/",
        "/dashboard",
        "/profile",
        "/portfolio",
        "/connections",
        "/lab",
        "/jobs",
      ],
    },
    sitemap: "https://www.pitchnpivot.com/sitemap.xml",
    host: "https://www.pitchnpivot.com",
  };
}
