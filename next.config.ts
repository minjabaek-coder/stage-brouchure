import type { NextConfig } from "next";

// Supabase Storage public URL host — derived from SUPABASE_URL at build time
// so we can whitelist it for next/image. When the env var is missing (dev/test)
// remotePatterns stays empty and only /uploads/** is served.
const supabaseHost = (() => {
  const raw = process.env.SUPABASE_URL;
  if (!raw) return null;
  try {
    return new URL(raw).host;
  } catch {
    return null;
  }
})();

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
    // Prod: Supabase Storage public URLs for the `images` bucket.
    // Path pattern is `/storage/v1/object/public/<bucket>/<file>`.
    remotePatterns: supabaseHost
      ? [
          {
            protocol: "https",
            hostname: supabaseHost,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
  },
};

export default nextConfig;
