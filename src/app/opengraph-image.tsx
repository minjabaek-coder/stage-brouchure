import { ImageResponse } from "next/og";
import { EVENT } from "@/lib/event";

export const runtime = "edge";
export const alt = `${EVENT.titleKo} · ${EVENT.titleEn}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(ellipse at center, #1a1612 0%, #0a0a0c 70%)",
          color: "#f4ede0",
          fontFamily: "serif",
          padding: 80,
        }}
      >
        <div
          style={{
            fontSize: 28,
            letterSpacing: 14,
            color: "#c5a572",
            textTransform: "uppercase",
            marginBottom: 24,
          }}
        >
          {EVENT.welcomeEn}
        </div>
        <div
          style={{
            fontSize: 96,
            letterSpacing: 12,
            fontWeight: 300,
            marginBottom: 16,
          }}
        >
          {EVENT.titleKo}
        </div>
        <div
          style={{
            fontSize: 40,
            letterSpacing: 8,
            color: "#c5a572",
            fontStyle: "italic",
            marginBottom: 56,
          }}
        >
          {EVENT.titleEn}
        </div>
        <div
          style={{
            display: "flex",
            gap: 32,
            fontSize: 28,
            letterSpacing: 4,
            color: "rgba(244,237,224,0.75)",
          }}
        >
          <span>{EVENT.date}</span>
          <span style={{ color: "#c5a572" }}>·</span>
          <span>{EVENT.venue}</span>
          <span style={{ color: "#c5a572" }}>·</span>
          <span>{EVENT.time}</span>
        </div>
      </div>
    ),
    size,
  );
}
