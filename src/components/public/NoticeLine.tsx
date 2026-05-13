import { type FC, type ReactNode } from "react";

interface NoticeLineProps {
  children: ReactNode;
  testId?: string;
}

/**
 * Centered single-line notice with a small gold ornament. Used between
 * sections on the home page to communicate audience-facing announcements
 * (entry time, etc.). Keep the text short — multi-line content should use
 * a card, not this component.
 */
const NoticeLine: FC<NoticeLineProps> = ({ children, testId }) => (
  <div
    className="flex items-center justify-center gap-2.5 py-4 text-center"
    data-testid={testId}
  >
    <span aria-hidden className="bg-gold/40 h-px w-5 shrink-0" />
    <p className="text-muted text-[13px] leading-[1.6]">{children}</p>
    <span aria-hidden className="bg-gold/40 h-px w-5 shrink-0" />
  </div>
);

export default NoticeLine;
