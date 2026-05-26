import type { MetadataRoute } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: `${SITE_URL}/`, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/search`, lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/brochure`, lastModified, changeFrequency: "weekly", priority: 0.8 },
  ];
}
