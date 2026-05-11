"use client";

import { type FC, type ReactNode, useEffect, useRef } from "react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string | ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Visual emphasis for destructive operations (red-ish CTA). */
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  testId?: string;
}

/**
 * Minimal confirm dialog using the native `<dialog>` element so we get
 * focus-trap + ESC-to-close + accessibility for free, no Radix dependency.
 */
const ConfirmDialog: FC<ConfirmDialogProps> = ({
  open,
  title,
  description,
  confirmLabel = "확인",
  cancelLabel = "취소",
  destructive = false,
  onConfirm,
  onCancel,
  testId,
}) => {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dlg = ref.current;
    if (!dlg) return;
    if (open && !dlg.open) dlg.showModal();
    if (!open && dlg.open) dlg.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        onCancel();
      }}
      onClose={onCancel}
      className="border-gold/40 bg-ink m-auto w-[min(420px,calc(100%-2rem))] rounded-[2px] border p-0 backdrop:bg-black/70"
      data-testid={testId}
    >
      <div className="px-6 py-6 text-center">
        <h2 className="font-serif-ko text-paper text-[18px] font-light tracking-[0.15em]">
          {title}
        </h2>
        {description && (
          <div className="font-serif-ko text-paper/65 mt-3 text-[13px] leading-[1.7] tracking-[0.05em]">
            {description}
          </div>
        )}
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="font-serif-ko border-gold/40 text-paper hover:bg-paper/5 flex-1 rounded-[2px] border bg-transparent px-4 py-2.5 text-[13px] tracking-[0.15em] transition-colors"
            data-testid={testId ? `${testId}-cancel` : undefined}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={[
              "font-serif-ko flex-1 rounded-[2px] px-4 py-2.5 text-[13px] tracking-[0.15em] transition-colors",
              destructive
                ? "bg-burgundy hover:bg-burgundy-deep text-paper"
                : "bg-gold text-ink hover:bg-gold-hi",
            ].join(" ")}
            data-testid={testId ? `${testId}-confirm` : undefined}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
};

export default ConfirmDialog;
