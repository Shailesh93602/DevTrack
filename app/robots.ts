import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Auth-gated dashboard sections aren't useful in search results.
        disallow: ["/dashboard/", "/api/"],
      },
    ],
    sitemap: "https://daily-dev-track.vercel.app/sitemap.xml",
    host: "https://daily-dev-track.vercel.app",
  };
}
