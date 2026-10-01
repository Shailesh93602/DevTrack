import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "DevTrack — developer progress dashboard",
    short_name: "DevTrack",
    description:
      "Log what you shipped, DSA problems, and side projects. Real-time multi-tab sync via Supabase Realtime.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#1a1a1a",
    orientation: "portrait",
    scope: "/",
    id: "https://daily-dev-track.vercel.app",
    icons: [
      { src: "/icon", sizes: "32x32", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
