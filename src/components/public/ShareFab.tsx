"use client";

import { type FC, useState } from "react";
import { Toaster } from "sonner";
import ShareDialog from "@/components/public/ShareDialog";

interface ShareFabProps {
  shareUrl: string;
}

/**
 * Floating action button anchored bottom-right of the stage. Opens
 * ShareDialog (URL + copy + QR + native share fallback). Sits inside Stage
 * so it appears on all public routes but not /admin (which mounts its own
 * Stage independently — see app/admin/page.tsx).
 */
const ShareFab: FC<ShareFabProps> = ({ shareUrl }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="공유하기 열기"
        className="text-ink fixed right-5 bottom-6 z-40 flex h-12 items-center gap-1.5 rounded-full bg-[var(--color-gold-soft)] pr-5 pl-4 text-[14px] font-medium tracking-[-0.01em] shadow-card transition-[transform,filter] hover:-translate-y-0.5 hover:brightness-[1.03] active:translate-y-0"
        data-testid="share-fab"
      >
        <i className="ti ti-share-3 text-[18px]" aria-hidden />
        공유하기
      </button>

      <Toaster richColors position="top-center" theme="light" />

      <ShareDialog
        open={open}
        onClose={() => setOpen(false)}
        shareUrl={shareUrl}
      />
    </>
  );
};

export default ShareFab;
