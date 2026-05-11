import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // S12+ writes uploaded images to /public/uploads with a `?v=<ts>` cache
    // buster so /search picks up new versions immediately. Next 16 refuses
    // query strings on local images unless explicitly listed.
    // search omitted = allow any (or no) query string on /uploads/**
    localPatterns: [{ pathname: "/uploads/**" }],
  },
};

export default nextConfig;
