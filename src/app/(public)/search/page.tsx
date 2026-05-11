import Stage from "@/components/layout/Stage";
import PageHeader from "@/components/ui/PageHeader";

export const metadata = {
  title: "자리 찾기 · 어울림 콘서트",
};

export default function SearchPage() {
  return (
    <Stage>
      <PageHeader title="자리 찾기" chapter="Chapter I" />
      <div className="animate-fade-up text-center">
        <p className="font-serif-ko text-paper/65 text-sm leading-[1.7] tracking-[0.05em]">
          자리 찾기 — 준비 중
          <br />
          이름과 전화번호 뒷자리 4자리로 좌석을 안내해 드립니다.
        </p>
      </div>
    </Stage>
  );
}
