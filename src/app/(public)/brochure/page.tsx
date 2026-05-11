import Stage from "@/components/layout/Stage";
import PageHeader from "@/components/ui/PageHeader";
import BrochureScroller from "@/components/public/BrochureScroller";

export const metadata = {
  title: "브로셔 · 어울림 콘서트",
};

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
