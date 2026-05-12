import { ImageResponse } from "next/og";
import { EVENT } from "@/lib/event";

export const runtime = "edge";
export const alt = EVENT.titleKo;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Open Graph 카드 — 라이트 톤. Satori 는 radial-gradient 가 빈약하게 그려져
 * 카카오톡에서 흰 박스로 보이는 사례가 있었으므로 단색 + linear-gradient 만.
 */
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
            "linear-gradient(180deg, #F8F3E9 0%, #F5EFE2 60%, #FFFFFF 100%)",
          color: "#0a0a0a",
          fontFamily: "serif",
          padding: 80,
        }}
      >
        <div
          style={{
            fontSize: 28,
            letterSpacing: 4,
            color: "#6B5A3F",
            marginBottom: 24,
          }}
        >
          {EVENT.preTitle}
        </div>
        <div
          style={{
            fontSize: 120,
            letterSpacing: -2,
            fontWeight: 600,
            marginBottom: 16,
            color: "#1A1410",
          }}
        >
          {EVENT.titleKo}
        </div>
        <div
          style={{
            fontSize: 36,
            letterSpacing: 8,
            color: "#B89968",
            fontStyle: "italic",
            marginBottom: 56,
          }}
        >
          {EVENT.ornament}
        </div>
        <div
          style={{
            display: "flex",
            gap: 32,
            fontSize: 28,
            letterSpacing: 2,
            color: "#444",
          }}
        >
          <span>{EVENT.dateValue}</span>
          <span style={{ color: "#B89968" }}>·</span>
          <span>{EVENT.venueShort}</span>
          <span style={{ color: "#B89968" }}>·</span>
          <span>{EVENT.timeValue}</span>
        </div>
      </div>
    ),
    size,
  );
}
