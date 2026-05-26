import { type FC } from "react";
import MessageItem from "@/components/public/MessageItem";
import MessageFormButton from "@/components/public/MessageFormButton";
import ReviewItem from "@/components/public/ReviewItem";
import ReviewFormButton from "@/components/public/ReviewFormButton";
import PhotosPreviewGrid from "@/components/public/PhotosPreviewGrid";
import PhotoUploadButton from "@/components/public/PhotoUploadButton";
import MessagesPreviewContent from "@/components/public/MessagesPreviewContent";
import { getRecentMessages } from "@/lib/messages";
import { getRecentReviews } from "@/lib/reviews";
import { getRecentPhotos } from "@/lib/photos";

/**
 * Home-page teaser — fetches the latest 3/3/6 items for the cheer/review/
 * photo tabs respectively and hands them to a client tab switcher.
 *
 * Server-component split: data fetching + the rendered panels live here so
 * the SSR HTML carries the active tab's content. The chip-bar and "전체
 * 보기" link live in `MessagesPreviewContent` (client) which toggles which
 * pre-rendered panel is visible — no client-side data fetching, no
 * flicker on tab switch.
 */
const MessagesPreview: FC = async () => {
  const [messages, reviews, photos] = await Promise.all([
    getRecentMessages(3),
    getRecentReviews(3),
    getRecentPhotos(6),
  ]);

  const cheerPanel =
    messages.length === 0 ? (
      <p
        className="text-muted py-6 text-center text-[13px] leading-[1.6]"
        data-testid="messages-empty"
      >
        첫 메시지를 남겨 주세요.
      </p>
    ) : (
      <ul className="flex flex-col gap-2.5" data-testid="messages-preview-list">
        {messages.map((m) => (
          <li key={m.id}>
            <MessageItem message={m} />
          </li>
        ))}
      </ul>
    );

  const reviewPanel =
    reviews.length === 0 ? (
      <p
        className="text-muted py-6 text-center text-[13px] leading-[1.6]"
        data-testid="reviews-preview-empty"
      >
        첫 후기를 남겨 주세요.
      </p>
    ) : (
      <ul className="flex flex-col gap-2.5" data-testid="reviews-preview-list">
        {reviews.map((r) => (
          <li key={r.id}>
            <ReviewItem review={r} compact />
          </li>
        ))}
      </ul>
    );

  const photosPanel = <PhotosPreviewGrid items={photos} />;

  return (
    <section
      className="pt-1.5 pb-6"
      aria-label="관객 콘텐츠 미리보기"
      data-testid="messages-preview"
    >
      <MessagesPreviewContent
        cheerPanel={cheerPanel}
        reviewPanel={reviewPanel}
        photosPanel={photosPanel}
        cheerCta={<MessageFormButton />}
        reviewCta={<ReviewFormButton />}
        photosCta={<PhotoUploadButton variant="primary" />}
      />
    </section>
  );
};

export default MessagesPreview;
