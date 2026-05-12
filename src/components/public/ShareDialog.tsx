"use client";

import Image from "next/image";
import { type FC, useEffect, useRef, useSyncExternalStore } from "react";
import { toast } from "sonner";
import { EVENT } from "@/lib/event";

const subscribeNoop = () => () => {};
const getNativeShareSupport = () =>
  typeof navigator !== "undefined" && typeof navigator.share === "function";
const getNativeShareServer = () => false;

interface ShareDialogProps {
  open: boolean;
  onClose: () => void;
  shareUrl: string;
}

const SHARE_TITLE = `${EVENT.titleKo} · ${EVENT.dateValue}`;
const SHARE_TEXT = `${EVENT.preTitle} — ${EVENT.titleKo} (${EVENT.dateValue} ${EVENT.venueShort})`;

const ShareDialog: FC<ShareDialogProps> = ({ open, onClose, shareUrl }) => {
  const ref = useRef<HTMLDialogElement>(null);
  const canNativeShare = useSyncExternalStore(
    subscribeNoop,
    getNativeShareSupport,
    getNativeShareServer,
  );

  useEffect(() => {
    const dlg = ref.current;
    if (!dlg) return;
    if (open && !dlg.open) dlg.showModal();
    if (!open && dlg.open) dlg.close();
  }, [open]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("주소를 복사했어요.");
    } catch {
      toast.error("복사에 실패했어요. 직접 선택해 복사해 주세요.");
    }
  };

  const handleNativeShare = async () => {
    try {
      await navigator.share({
        title: SHARE_TITLE,
        text: SHARE_TEXT,
        url: shareUrl,
      });
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      toast.error("공유를 완료하지 못했어요.");
    }
  };

  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClose={onClose}
      className="bg-paper border-line m-auto w-[min(360px,calc(100%-2rem))] rounded-2xl border p-0 backdrop:bg-black/45"
      style={{ borderWidth: "0.5px" }}
      data-testid="share-dialog"
    >
      <div className="relative px-6 pt-7 pb-6 text-center">
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="text-muted hover:text-ink absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full transition-colors"
          data-testid="share-dialog-close"
        >
          <i className="ti ti-x text-[18px]" />
        </button>

        <p className="text-gold text-[11px] font-medium tracking-[0.3em] uppercase">
          Share
        </p>
        <h2 className="font-serif-ko text-ink mt-2 text-[20px] font-semibold tracking-[-0.01em]">
          공유하기
        </h2>
        <p className="text-muted mt-1.5 text-[13px] leading-[1.6]">
          {EVENT.titleKo} · {EVENT.dateValue}
          <span className="text-muted-light mx-1.5">·</span>
          {EVENT.venueShort}
        </p>

        <div
          className="border-line bg-cream-100 mx-auto mt-5 flex aspect-square w-[180px] items-center justify-center rounded-xl p-3"
          style={{ borderWidth: "0.5px" }}
          data-testid="share-qr"
        >
          <Image
            src="/share-qr.svg"
            alt="공유 QR 코드"
            width={180}
            height={180}
            unoptimized
            className="h-full w-full"
          />
        </div>
        <p className="text-muted-light mt-2 text-[12px]">
          QR 을 카메라로 인식해 바로 입장
        </p>

        <div
          className="border-line bg-surface mt-5 flex items-center gap-2 rounded-lg px-3 py-2.5"
          style={{ borderWidth: "0.5px" }}
        >
          <span
            className="text-muted min-w-0 flex-1 truncate text-left text-[13px]"
            data-testid="share-url"
          >
            {shareUrl}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="bg-ink text-paper inline-flex shrink-0 items-center gap-1 rounded-md px-3 py-1.5 text-[12px] font-medium tracking-[-0.01em] transition-opacity hover:opacity-90"
            data-testid="share-copy"
          >
            <i className="ti ti-copy text-[14px]" aria-hidden />
            복사
          </button>
        </div>

        {canNativeShare && (
          <button
            type="button"
            onClick={handleNativeShare}
            className="bg-burgundy text-paper mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-[14px] font-medium tracking-[-0.01em] transition-opacity hover:opacity-90"
            data-testid="share-native"
          >
            <i className="ti ti-share-3 text-[16px]" aria-hidden />
            기기 공유 시트 열기
          </button>
        )}
      </div>
    </dialog>
  );
};

export default ShareDialog;
