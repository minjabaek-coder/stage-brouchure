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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "어울림 콘서트 · Harmony Concert",
  description:
    "(사)한국예술가곡총연합회 · 어울림 콘서트 (2026.5.26 송파문화예술회관)",
  openGraph: {
    title: "어울림 콘서트 · Harmony Concert",
    description: "협력단체와 함께하는 앙상블의 향연 · 2026.5.26 송파문화예술회관",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "어울림 콘서트 · Harmony Concert",
  },
};

// PRD §2.1 — mobile-first. user-scalable=no 는 a11y 위반(WCAG 1.4.4)이므로
// 5x 까지 확대 허용. iOS 입력 포커스 자동 줌은 input 폰트 16px+ 로 이미 방지됨.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
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
