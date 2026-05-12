"use client";

import { type FC, type ReactNode, useEffect, useRef } from "react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string | ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  testId?: string;
}

/** Light-theme confirm dialog using native <dialog>. */
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
      className="bg-paper m-auto w-[min(420px,calc(100%-2rem))] rounded-2xl border border-line p-0 backdrop:bg-black/40"
      style={{ borderWidth: "0.5px" }}
      data-testid={testId}
    >
      <div className="px-6 py-6 text-center">
        <h2 className="font-serif-ko text-ink text-[18px] font-medium tracking-[-0.01em]">
          {title}
        </h2>
        {description && (
          <div className="text-muted mt-3 text-[13px] leading-[1.6]">
            {description}
          </div>
        )}
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="border-line text-ink hover:bg-cream-100 flex-1 rounded-lg border bg-white px-4 py-2.5 text-[13px] font-medium tracking-[-0.01em] transition-colors"
            style={{ borderWidth: "0.5px" }}
            data-testid={testId ? `${testId}-cancel` : undefined}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={[
              "flex-1 rounded-lg px-4 py-2.5 text-[13px] font-medium tracking-[-0.01em] transition-opacity hover:opacity-90",
              destructive
                ? "bg-burgundy text-paper"
                : "bg-ink text-paper",
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
