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
        className="border-line-strong bg-paper text-ink hover:bg-cream-100 fixed right-5 bottom-6 z-40 flex h-14 w-14 items-center justify-center rounded-full border shadow-card backdrop-blur transition-[transform,background-color] hover:-translate-y-0.5 active:translate-y-0"
        style={{ borderWidth: "0.5px" }}
        data-testid="share-fab"
      >
        <i className="ti ti-share-3 text-[22px]" aria-hidden />
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
