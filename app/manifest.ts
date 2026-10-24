import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "DevTrack — developer progress dashboard",
    short_name: "DevTrack",
    description:
      "Log what you shipped, the DSA problems you solved, and the side projects you moved forward.",
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
