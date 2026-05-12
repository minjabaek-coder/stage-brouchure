import Stage from "@/components/layout/Stage";
import PageHeader from "@/components/ui/PageHeader";
import SeatMapImage from "@/components/public/SeatMapImage";

export const metadata = {
  title: "좌석배치도 · 어울림 콘서트",
};

// SeatMapImage 가 prisma 로 asset 조회 — 항상 SSR.
export const dynamic = "force-dynamic";

// NOTE
// 이름+전화 뒷4자리 검색 UI 는 현재 비활성화 (PRD 변경: "티켓은 현장 배포").
// 검색 컴포넌트(SearchForm/SeatResultCard/NoResultCard)와 /api/search 라우트는
// 추후 재활성화를 위해 코드는 그대로 보존. 본 페이지에서는 import 하지 않는다.

export default function SearchPage() {
  return (
    <Stage>
      <PageHeader title="좌석배치도" chapter="Chapter I" />
      <p className="text-muted mb-6 text-center text-[14px] leading-[1.7]">
        티켓은 현장에서 배포합니다.
        <br />
        아래 좌석배치도를 확인해 주세요.
      </p>
      <SeatMapImage />
    </Stage>
  );
}
