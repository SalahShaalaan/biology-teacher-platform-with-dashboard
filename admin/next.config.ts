import type { NextConfig } from "next";

const API_URL = process.env.API_URL || "http://localhost:5000";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000",
        pathname: "/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/images/:path*",
        destination: `${API_URL}/images/:path*`,
      },
      {
        source: "/content/:path*",
        destination: `${API_URL}/content/:path*`,
      },
    ];
  },
};

export default nextConfig;
