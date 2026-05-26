import { type FC } from "react";
import type { PublicReview } from "@/lib/reviews";

interface ReviewItemProps {
  review: PublicReview;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const kstMs = d.getTime() + 9 * 60 * 60 * 1000;
  const kst = new Date(kstMs);
  const m = String(kst.getUTCMonth() + 1);
  const day = String(kst.getUTCDate());
  return `${m}/${day}`;
}

/**
 * Single review entry — nickname, body (up to 500 chars), KST short date.
 * Used in /messages?tab=review. Visual tone mirrors MessageItem so the
 * three tabs feel cohesive; only the body length cap differs.
 */
const ReviewItem: FC<ReviewItemProps> = ({ review }) => (
  <article
    className="border-line bg-paper rounded-xl px-[18px] py-4"
    style={{ borderWidth: "0.5px" }}
    data-testid="review-item"
  >
    <header className="mb-1.5 flex items-baseline justify-between gap-2">
      <span
        className="font-serif-ko text-ink text-[14px] font-medium tracking-[-0.01em]"
        data-testid="review-nickname"
      >
        {review.nickname}
      </span>
      <span className="text-muted-light text-[11px] tracking-[-0.01em]">
        {formatDate(review.createdAt)}
      </span>
    </header>
    <p
      className="font-serif-ko text-ink text-[14px] leading-[1.6] whitespace-pre-wrap"
      data-testid="review-body"
    >
      {review.body}
    </p>
  </article>
);

export default ReviewItem;
