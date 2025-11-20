import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: "/api/revalidate",
        destination: "/api/revalidate",
      },
      {
        source: "/api/:path*",
        destination: new URL(
          "/api/:path*",
          process.env.NEXT_PUBLIC_API_BASE_URL
        ).toString(),
      },
    ];
  },
  experimental: {
    reactCompiler: true,
  },
  images: {
    remotePatterns: [new URL(`${process.env.NEXT_PUBLIC_CDN_URL}/**`)],
  },
};

export default nextConfig;
