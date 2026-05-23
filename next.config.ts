import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Dev/test: /public/uploads/<file>?v=<ts> served directly by Next.
    // 2026-05-12 light theme adds hero logo + sponsor logos served from
    // /public root, also whitelist them.
    localPatterns: [
      { pathname: "/uploads/**" },
      { pathname: "/hero-title.png" },
      { pathname: "/sponsor-*.png" },
      { pathname: "/sponsor-*.jpg" },
    ],
    // Prod: Vercel Blob public URLs.
    // Format: https://<storeId>.public.blob.vercel-storage.com/<pathname>
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
