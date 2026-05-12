"use client";

import { type FC, type DragEvent, useId, useRef, useState } from "react";

interface DropzoneProps {
  /** comma-separated `accept` for native file picker (e.g., ".csv,text/csv") */
  accept: string;
  /** Max byte size; files above this trigger onError("file too large"). */
  maxBytes: number;
  /** Allow multiple file selection (S13 brochure bulk). Default false. */
  multiple?: boolean;
  /** Called with the validated File list when the user picks/drops. */
  onFiles: (files: File[]) => void;
  /** Called when validation fails (size / count). */
  onError?: (message: string) => void;
  /** Inner label content (Korean copy varies per section). */
  label: string;
  /** Helper text shown below the label. */
  hint?: string;
  /** data-testid for e2e targeting. */
  testId?: string;
}

const Dropzone: FC<DropzoneProps> = ({
  accept,
  maxBytes,
  multiple = false,
  onFiles,
  onError,
  label,
  hint,
  testId,
}) => {
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  function handleFiles(list: FileList | null) {
    if (!list || list.length === 0) return;
    const files = Array.from(list);
    const oversized = files.find((f) => f.size > maxBytes);
    if (oversized) {
      onError?.(
        `파일 용량이 ${(maxBytes / 1024 / 1024).toFixed(0)}MB 를 초과합니다 (${oversized.name}: ${(oversized.size / 1024 / 1024).toFixed(1)}MB)`,
      );
      return;
    }
    if (!multiple && files.length > 1) {
      onError?.("파일은 한 개만 선택할 수 있습니다.");
      return;
    }
    onFiles(files);
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
      className={[
        "rounded-xl border border-dashed px-5 py-8 text-center transition-colors",
        dragOver
          ? "border-gold bg-cream-100"
          : "border-line-strong hover:border-gold/60 bg-white",
      ].join(" ")}
      data-testid={testId}
    >
      <p className="text-gold mb-2 text-[11px] font-medium tracking-[0.3em] uppercase">
        Drop or Browse
      </p>
      <p className="text-ink text-[14px] leading-snug">{label}</p>
      {hint && (
        <p className="text-muted mt-1 text-[12px]">{hint}</p>
      )}
      <input
        ref={fileInputRef}
        id={inputId}
        type="file"
        accept={accept}
        multiple={multiple}
        className="sr-only"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="bg-ink text-paper mt-4 inline-block rounded-lg px-4 py-2 text-[13px] font-medium tracking-[-0.01em] transition-opacity hover:opacity-90"
      >
        파일 선택
      </button>
    </div>
  );
};

export default Dropzone;
