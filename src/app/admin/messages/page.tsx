import { Toaster } from "sonner";
import Stage from "@/components/layout/Stage";
import AdminNav from "@/components/admin/AdminNav";
import AdminMessagesList from "@/components/admin/AdminMessagesList";
import AdminReviewsList from "@/components/admin/AdminReviewsList";
import AdminPhotosList from "@/components/admin/AdminPhotosList";
import AdminModerationTabs from "@/components/admin/AdminModerationTabs";
import { getAllMessages, countMessages } from "@/lib/messages";
import { getAllReviews, countReviews } from "@/lib/reviews";
import { getAllPhotos, countPhotos } from "@/lib/photos";

export const metadata = {
  title: "관리자 · 관객 콘텐츠 · 어울림 콘서트",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  const [
    messages,
    messagesTotal,
    reviews,
    reviewsTotal,
    photos,
    photosTotal,
  ] = await Promise.all([
    getAllMessages(),
    countMessages(),
    getAllReviews(),
    countReviews(),
    getAllPhotos(),
    countPhotos(),
  ]);

  return (
    <Stage>
      <Toaster richColors position="top-center" theme="light" />
      <header
        className="pt-2 pb-4 text-center"
        data-testid="admin-messages-header"
      >
        <p className="text-gold text-[11px] font-medium tracking-[0.3em] uppercase">
          Stage Manager
        </p>
        <h1 className="font-serif-ko text-ink mt-2 text-[24px] font-semibold tracking-[-0.01em]">
          관객 콘텐츠 관리
        </h1>
        <p className="text-muted mt-2 text-[13px] leading-[1.6]">
          관객이 보낸 응원 메시지·후기·사진을 확인하고 부적절한 항목은
          삭제합니다.
        </p>
      </header>

      <AdminNav active="messages" />

      <AdminModerationTabs
        cheerCount={messagesTotal}
        reviewCount={reviewsTotal}
        photoCount={photosTotal}
        cheerPanel={<AdminMessagesList items={messages} />}
        reviewPanel={<AdminReviewsList items={reviews} />}
        photosPanel={<AdminPhotosList items={photos} />}
      />
    </Stage>
  );
}
