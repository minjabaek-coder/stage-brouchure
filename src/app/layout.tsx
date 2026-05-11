import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Noto_Serif_KR } from "next/font/google";
import BackgroundLayer from "@/components/layout/BackgroundLayer";
import "./globals.css";

const notoSerifKr = Noto_Serif_KR({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
  variable: "--font-noto-serif-kr",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

export const metadata: Metadata = {
  title: "어울림 콘서트 · Harmony Concert",
  description:
    "(사)한국예술가곡총연합회 · 어울림 콘서트 (2026.5.26 송파문화예술회관)",
};

// PRD §2.1 — mobile-first, no zoom
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="ko"
      className={`${notoSerifKr.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <BackgroundLayer />
        {children}
      </body>
    </html>
  );
}
