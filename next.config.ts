import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Removed 'export' to allow API routes for image proxying
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.cdninstagram.com',
      },
      {
        protocol: 'https',
        hostname: '*.fbcdn.net',
      },
      {
        protocol: 'https',
        hostname: '*.tiktokcdn.com',
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
    dirs: []
  },
  typescript: {
    ignoreBuildErrors: true
  }
};

export default nextConfig;
