import Stage from "@/components/layout/Stage";
import PageHeader from "@/components/ui/PageHeader";
import SearchForm from "@/components/public/SearchForm";
import SeatMapImage from "@/components/public/SeatMapImage";

export const metadata = {
  title: "자리 찾기 · 어울림 콘서트",
};

// 좌석맵이 운영자 업로드로 바뀔 때마다 즉시 반영되도록 SSR 강제. 빌드 시점에
// Supabase 를 조회할 필요도 사라진다 (`/brochure` 와 같은 이유).
export const dynamic = "force-dynamic";

export default function SearchPage() {
  return (
    <Stage>
      <PageHeader title="자리 찾기" chapter="Chapter I" />
      <SearchForm />
      <SeatMapImage />
    </Stage>
  );
}
