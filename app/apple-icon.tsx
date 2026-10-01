import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg,#1a1a1a 0%,#000000 100%)",
        color: "#ffffff",
        fontSize: 100,
        fontWeight: 800,
        letterSpacing: "-4px",
        borderRadius: 30,
        fontFamily: "sans-serif",
      }}
    >
      DT
    </div>,
    size
  );
}
