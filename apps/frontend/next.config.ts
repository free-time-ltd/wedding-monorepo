import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: new URL(
          "/api/:path*",
          process.env.NEXT_PUBLIC_API_BASE_URL
        ).toString(),
      },
    ];
  },
};

export default nextConfig;
