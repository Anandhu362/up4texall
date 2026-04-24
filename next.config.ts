import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    unoptimized: true, // Required for static export
  },
  // Enable static export for Vercel
  output: 'standalone',
};

export default nextConfig;
