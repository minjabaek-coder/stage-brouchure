import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "어울림 콘서트 · Harmony Concert",
  description:
    "(사)한국예술가곡총연합회 · 어울림 콘서트 (2026.5.26 송파문화예술회관)",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
