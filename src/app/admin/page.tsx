import Stage from "@/components/layout/Stage";
import AdminSection from "@/components/admin/AdminSection";
import AdminStatusBar from "@/components/admin/AdminStatusBar";
import { prisma } from "@/lib/db";

export const metadata = {
  title: "관리자 · 어울림 콘서트",
  // robots.txt already disallows /admin, but belt-and-braces:
  robots: { index: false, follow: false },
};

const BROCHURE_KEYS = Array.from(
  { length: 8 },
  (_, i) => `brochure_${String(i + 1).padStart(2, "0")}`,
);

async function loadStats() {
  const [attendeeCount, seatMap, brochures, lastBackup] = await Promise.all([
    prisma.attendee.count(),
    prisma.asset.findUnique({ where: { key: "seat_map" } }),
    prisma.asset.findMany({ where: { key: { in: BROCHURE_KEYS } } }),
    prisma.csvBackup.findFirst({ orderBy: { uploadedAt: "desc" } }),
  ]);

  const lastBrochureUpload = brochures.length
    ? brochures.reduce<Date>((acc, a) => (a.updatedAt > acc ? a.updatedAt : acc), brochures[0]!.updatedAt)
    : null;

  return {
    attendeeCount,
    lastSeatMapUpload: seatMap?.updatedAt ?? null,
    lastBrochureUpload,
    lastCsvUpload: lastBackup?.uploadedAt ?? null,
  };
}

export default async function AdminPage() {
  const stats = await loadStats();

  return (
    <Stage>
      <header className="pt-2 pb-4 text-center" data-testid="admin-header">
        <p className="font-serif-en text-gold text-[12px] tracking-[0.4em] uppercase italic">
          Stage Manager
        </p>
        <h1 className="font-serif-ko text-paper mt-2 text-[26px] font-light tracking-[0.2em]">
          관리자 페이지
        </h1>
        <p className="font-serif-ko text-paper/55 mt-2 text-[13px] tracking-[0.05em]">
          명단 · 좌석배치도 · 브로셔를 업로드하고 즉시 반영합니다.
        </p>
      </header>

      <AdminStatusBar
        attendeeCount={stats.attendeeCount}
        lastCsvUpload={stats.lastCsvUpload}
        lastSeatMapUpload={stats.lastSeatMapUpload}
        lastBrochureUpload={stats.lastBrochureUpload}
      />

      <AdminSection
        eyebrow="Section I"
        title="명단 (CSV)"
        description="이름·전화 뒷자리 4자리·좌석·메모를 담은 CSV 를 업로드하면 기존 명단을 전체 교체합니다. 업로드 직전 명단은 자동 백업됩니다."
        testId="admin-csv-section"
      >
        <p className="font-serif-en text-paper/40 text-[12px] tracking-[0.2em] italic">
          — 준비 중 (S11) —
        </p>
      </AdminSection>

      <AdminSection
        eyebrow="Section II"
        title="좌석배치도"
        description="좌석배치도 이미지(JPG/PNG, 5MB 이하) 한 장을 업로드하면 자리 찾기 페이지에 즉시 반영됩니다."
        testId="admin-seatmap-section"
      >
        <p className="font-serif-en text-paper/40 text-[12px] tracking-[0.2em] italic">
          — 준비 중 (S12) —
        </p>
      </AdminSection>

      <AdminSection
        eyebrow="Section III"
        title="브로셔 (8장)"
        description="브로셔 8장(JPG/PNG)을 일괄 업로드하거나 슬롯별로 개별 교체할 수 있습니다."
        testId="admin-brochure-section"
      >
        <p className="font-serif-en text-paper/40 text-[12px] tracking-[0.2em] italic">
          — 준비 중 (S13) —
        </p>
      </AdminSection>
    </Stage>
  );
}
