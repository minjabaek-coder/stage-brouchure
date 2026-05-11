import Stage from "@/components/layout/Stage";
import PageHeader from "@/components/ui/PageHeader";
import BrochureScroller from "@/components/public/BrochureScroller";

export const metadata = {
  title: "브로셔 · 어울림 콘서트",
};

// 빌드 시점에 Prisma 로 Supabase 를 조회해 prerender 하면 ① 빌드 환경의
// DB 접근에 의존 ② 운영자 업로드 후 revalidatePath 이 새 이미지 즉시 반영
// 못함 — 양쪽 다 곤란. 항상 SSR 로 강제.
export const dynamic = "force-dynamic";

export default function BrochurePage() {
  return (
    <Stage>
      <PageHeader title="브로셔" chapter="Chapter II" />
      <p className="font-serif-ko text-paper/65 mb-6 text-center text-sm leading-[1.7] tracking-[0.05em]">
        (사)한국예술가곡총연합회가 마련한
        <br />
        어울림콘서트의 모든 것
      </p>
      <BrochureScroller />
    </Stage>
  );
}
