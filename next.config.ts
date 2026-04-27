import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Remove unoptimized: true to allow Vercel to handle images correctly */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com', // Allows Firebase images
      },
    ],
  },
  /* Remove output: 'standalone' as Vercel handles this automatically */
};

export default nextConfig;