import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "DevTrack — developer progress dashboard";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(135deg,#1a1a1a 0%,#000000 100%)",
        color: "#ffffff",
        padding: 80,
        fontFamily: "sans-serif",
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 14,
            background: "rgba(255,255,255,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 36,
            fontWeight: 800,
          }}
        >
          DT
        </div>
        <span style={{ fontSize: 32, fontWeight: 600, opacity: 0.9 }}>
          DevTrack
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <h1
          style={{
            fontSize: 72,
            fontWeight: 800,
            margin: 0,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
          }}
        >
          Developer progress dashboard
        </h1>
        <p style={{ fontSize: 30, margin: 0, opacity: 0.85, lineHeight: 1.3 }}>
          Log what you shipped, DSA problems, and side projects. Real-time
          multi-tab sync via Supabase Realtime.
        </p>
      </div>
      <div style={{ fontSize: 22, opacity: 0.75 }}>
        Built by Shailesh Chaudhari · shaileshchaudhari.vercel.app
      </div>
    </div>,
    size
  );
}
