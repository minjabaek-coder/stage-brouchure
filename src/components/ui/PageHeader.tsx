import { type FC } from "react";
import BackButton from "@/components/ui/BackButton";

interface PageHeaderProps {
  title: string;
  /** Roman-numeral / Cormorant italic eyebrow above the title (e.g., "Chapter I"). */
  chapter?: string;
}

/**
 * Reference HTML lines 402-440, 1018-1022, 1087-1091 — sticky header used on
 * the search/brochure pages: ← back button, centered title (with optional
 * chapter eyebrow), and a 40-px spacer that keeps the title visually centered.
 */
const PageHeader: FC<PageHeaderProps> = ({ title, chapter }) => (
  <div
    className="sticky top-0 z-10 mb-7 flex items-center justify-between border-b border-[rgba(197,165,114,0.2)] bg-gradient-to-b from-[#0a0a0c] from-0% via-[#0a0a0c] via-80% to-transparent to-100% px-0 pt-2 pb-6"
    data-testid="page-header"
  >
    <BackButton />
    <h1
      className="font-serif-ko text-paper text-center text-[18px] font-light tracking-[0.3em]"
      data-testid="page-title"
    >
      {chapter && (
        <small className="font-serif-en text-gold mb-1 block text-[11px] tracking-[0.4em] not-italic">
          {chapter}
        </small>
      )}
      {title}
    </h1>
    <div aria-hidden className="w-10" />
  </div>
);

export default PageHeader;
