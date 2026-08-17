/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // Canonicalize the apex domain onto www so search engines and shared
      // links all converge on one host.
      {
        source: "/:path*",
        has: [{ type: "host", value: "pitchnpivot.com" }],
        destination: "https://www.pitchnpivot.com/:path*",
        permanent: true,
      },
    ];
  },
};
export default nextConfig;
