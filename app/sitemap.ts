import type { MetadataRoute } from "next";

const BASE = "https://daily-dev-track.vercel.app";

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/signup",
  "/legal/privacy",
  "/legal/terms",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return PUBLIC_PATHS.map((p) => ({
    url: `${BASE}${p}`,
    lastModified: now,
    changeFrequency: p === "/" ? "weekly" : "monthly",
    priority: p === "/" ? 1.0 : 0.5,
  }));
}
