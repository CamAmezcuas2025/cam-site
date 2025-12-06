import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // ✅ Supabase images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'voplybpcwafrrmleunyt.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;