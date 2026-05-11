import Stage from "@/components/layout/Stage";
import PageHeader from "@/components/ui/PageHeader";
import SearchForm from "@/components/public/SearchForm";

export const metadata = {
  title: "자리 찾기 · 어울림 콘서트",
};

export default function SearchPage() {
  return (
    <Stage>
      <PageHeader title="자리 찾기" chapter="Chapter I" />
      <SearchForm />
    </Stage>
  );
}
