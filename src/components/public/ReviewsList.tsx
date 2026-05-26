import { type FC } from "react";
import ReviewItem from "@/components/public/ReviewItem";
import type { PublicReview } from "@/lib/reviews";

interface ReviewsListProps {
  items: PublicReview[];
}

const ReviewsList: FC<ReviewsListProps> = ({ items }) => {
  if (items.length === 0) {
    return (
      <p
        className="text-muted py-12 text-center text-[14px] leading-[1.6]"
        data-testid="reviews-list-empty"
      >
        아직 후기가 없어요.
        <br />첫 후기를 남겨 주세요.
      </p>
    );
  }
  return (
    <ul className="flex flex-col gap-3" data-testid="reviews-list">
      {items.map((r) => (
        <li key={r.id}>
          <ReviewItem review={r} />
        </li>
      ))}
    </ul>
  );
};

export default ReviewsList;
