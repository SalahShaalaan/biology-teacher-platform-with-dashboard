import type { NextConfig } from "next";
const API_URL = process.env.API_URL || "http://localhost:5000";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    qualities: [25, 50, 75, 80, 90, 100],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000",
        pathname: "/images/**",
      },
      {
        protocol: "https",
        hostname: "your-production-domain.com",
      },
      {
        protocol: "https",
        hostname: "*",
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
