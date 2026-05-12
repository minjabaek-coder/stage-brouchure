import { type FC } from "react";
import BackButton from "@/components/ui/BackButton";

interface PageHeaderProps {
  title: string;
  /** Eyebrow above the title, e.g. "Chapter I". */
  chapter?: string;
}

/**
 * Light-theme sticky page header for /search and /brochure: ← back button,
 * centered title (with optional eyebrow), and a 40px spacer that keeps the
 * title visually centered.
 */
const PageHeader: FC<PageHeaderProps> = ({ title, chapter }) => (
  <div
    className="border-line bg-paper/90 sticky top-0 z-10 mb-6 flex items-center justify-between gap-2 border-b py-3 backdrop-blur"
    style={{ borderBottomWidth: "0.5px" }}
    data-testid="page-header"
  >
    <BackButton />
    <h1 className="text-center" data-testid="page-title">
      {chapter && (
        <small className="text-gold mb-0.5 block text-[11px] font-medium tracking-[0.3em] uppercase">
          {chapter}
        </small>
      )}
      <span className="font-serif-ko text-ink text-[18px] font-medium tracking-[-0.01em]">
        {title}
      </span>
    </h1>
    <div aria-hidden className="w-10" />
  </div>
);

export default PageHeader;
