import Stage from "@/components/layout/Stage";
import PageHeader from "@/components/ui/PageHeader";

export const metadata = {
  title: "브로셔 · 어울림 콘서트",
};

export default function BrochurePage() {
  return (
    <Stage>
      <PageHeader title="브로셔" chapter="Chapter II" />
      <div className="animate-fade-up text-center">
        <p className="font-serif-ko text-paper/65 text-sm leading-[1.7] tracking-[0.05em]">
          브로셔 — 준비 중
          <br />
          어울림콘서트의 프로그램과 출연진 안내가 곧 공개됩니다.
        </p>
      </div>
    </Stage>
  );
}
