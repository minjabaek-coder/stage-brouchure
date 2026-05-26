import Stage from "@/components/layout/Stage";
import PageHeader from "@/components/ui/PageHeader";
import MessagesList from "@/components/public/MessagesList";
import MessageFormButton from "@/components/public/MessageFormButton";
import ReviewsList from "@/components/public/ReviewsList";
import ReviewFormButton from "@/components/public/ReviewFormButton";
import PhotosGallery from "@/components/public/PhotosGallery";
import PhotoUploadButton from "@/components/public/PhotoUploadButton";
import MessagesTabs from "@/components/public/MessagesTabs";
import { getAllMessages, countMessages } from "@/lib/messages";
import { getAllReviews, countReviews } from "@/lib/reviews";
import { getAllPhotos, countPhotos } from "@/lib/photos";

export const metadata = {
  title: "응원 메시지 · 어울림 콘서트",
};

// DB-backed lists — always SSR with fresh data; admin deletions / new posts
// propagate via revalidatePath in their respective routes.
export const dynamic = "force-dynamic";

export default async function MessagesPage() {
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

  const cheerPanel = (
    <>
      <p className="text-muted mb-4 text-center text-[13px] leading-[1.6]">
        지금까지{" "}
        <span data-testid="messages-total">{messagesTotal}</span>개의 메시지가
        있습니다.
      </p>
      <div className="mb-5">
        <MessageFormButton variant="hero" />
      </div>
      <MessagesList items={messages} />
    </>
  );

  const reviewPanel = (
    <>
      <p className="text-muted mb-4 text-center text-[13px] leading-[1.6]">
        지금까지 <span data-testid="reviews-total">{reviewsTotal}</span>개의
        후기가 있습니다.
      </p>
      <div className="mb-5">
        <ReviewFormButton variant="hero" />
      </div>
      <ReviewsList items={reviews} />
    </>
  );

  const photosPanel = (
    <>
      <p className="text-muted mb-4 text-center text-[13px] leading-[1.6]">
        지금까지 <span data-testid="photos-total">{photosTotal}</span>장의
        사진이 공유되었습니다.
      </p>
      <div className="mb-5">
        <PhotoUploadButton variant="hero" />
      </div>
      <PhotosGallery items={photos} />
    </>
  );

  return (
    <Stage>
      <PageHeader title="응원 메시지" chapter="Chapter III" />
      <MessagesTabs
        cheerPanel={cheerPanel}
        reviewPanel={reviewPanel}
        photosPanel={photosPanel}
      />
    </Stage>
  );
}
