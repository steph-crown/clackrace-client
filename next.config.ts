import type { NextConfig } from "next";

const api =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:4000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/auth/:path*",
        destination: `${api}/api/auth/:path*`,
      },
      {
        source: "/api/clack/:path*",
        destination: `${api}/:path*`,
      },
    ];
  },
};

export default nextConfig;
