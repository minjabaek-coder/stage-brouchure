import Stage from "@/components/layout/Stage";
import PageHeader from "@/components/ui/PageHeader";
import BrochureScroller from "@/components/public/BrochureScroller";

export const metadata = {
  title: "브로셔 · 어울림 콘서트",
};

export const dynamic = "force-dynamic";

export default function BrochurePage() {
  return (
    <Stage>
      <PageHeader title="공연 안내서" chapter="Chapter II" />
      <p className="text-muted mb-6 text-center text-[14px] leading-[1.7]">
        (사)한국예술가곡총연합회가 마련한
        <br />
        어울림콘서트의 모든 것
      </p>
      <BrochureScroller />
    </Stage>
  );
}
