"use client";

import { useRouter } from "next/navigation";
import {
  type ChangeEvent,
  type FC,
  type FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import imageCompression from "browser-image-compression";

interface PhotoUploadButtonProps {
  variant?: "primary" | "ghost" | "hero";
  label?: string;
}

const NICK_MIN = 2;
const NICK_MAX = 10;
const CAPTION_MAX = 100;
const MAX_FILES = 3;

interface ApiError {
  error?: { code?: string; message?: string };
}

const COMPRESSION_OPTS = {
  maxSizeMB: 0.8,
  maxWidthOrHeight: 1600,
  useWebWorker: true,
  fileType: "image/jpeg",
  initialQuality: 0.8,
} as const;

/**
 * Photo upload dialog. 2-stage compression pipeline (PRD §4.5):
 *   ① browser-image-compression (here) → ≤800KB · 1600px · JPEG 80
 *   ② server sharp (POST /api/photos) → 1200px · JPEG 75 + EXIF strip
 *
 * Why client-side compression: Vercel Functions cap request bodies at
 * 4.5MB, and modern phone JPEGs run 3–8MB. We never want a user to hit
 * "too large" after waiting through a slow mobile upload.
 */
const PhotoUploadButton: FC<PhotoUploadButtonProps> = ({
  variant = "hero",
  label = "사진 올리기",
}) => {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [nickname, setNickname] = useState("");
  const [caption, setCaption] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg) return;
    if (open && !dlg.open) dlg.showModal();
    if (!open && dlg.open) dlg.close();
  }, [open]);

  // Object URLs released on unmount/file change so we don't leak.
  useEffect(() => {
    return () => {
      previews.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [previews]);

  const reset = () => {
    previews.forEach((u) => URL.revokeObjectURL(u));
    setNickname("");
    setCaption("");
    setFiles([]);
    setPreviews([]);
    setSubmitting(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClose = () => {
    setOpen(false);
    reset();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []);
    if (picked.length === 0) return;
    if (picked.length > MAX_FILES) {
      toast.error(`사진은 한 번에 최대 ${MAX_FILES}장까지 올릴 수 있어요.`);
      e.target.value = "";
      return;
    }
    previews.forEach((u) => URL.revokeObjectURL(u));
    setFiles(picked);
    setPreviews(picked.map((f) => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;

    const trimmedNick = nickname.trim();
    const trimmedCaption = caption.trim();
    if (trimmedNick.length < NICK_MIN || trimmedNick.length > NICK_MAX) {
      toast.error(`닉네임은 ${NICK_MIN}–${NICK_MAX}자여야 합니다.`);
      return;
    }
    if (trimmedCaption.length > CAPTION_MAX) {
      toast.error(`캡션은 ${CAPTION_MAX}자 이하여야 합니다.`);
      return;
    }
    if (files.length < 1 || files.length > MAX_FILES) {
      toast.error("사진은 1–3장 사이로 올려 주세요.");
      return;
    }

    setSubmitting(true);
    toast.loading("사진을 압축하고 있어요…", { id: "photo-upload" });

    try {
      const compressed = await Promise.all(
        files.map((f) => imageCompression(f, COMPRESSION_OPTS)),
      );

      toast.loading("사진을 업로드하고 있어요…", { id: "photo-upload" });

      const fd = new FormData();
      fd.append("nickname", trimmedNick);
      if (trimmedCaption) fd.append("caption", trimmedCaption);
      compressed.forEach((c) => fd.append("files", c, c.name || "photo.jpg"));

      const res = await fetch("/api/photos", { method: "POST", body: fd });

      if (res.status === 429) {
        toast.error("잠시 후 다시 시도해 주세요. (10분에 1회만 업로드 가능)", {
          id: "photo-upload",
        });
        setSubmitting(false);
        return;
      }
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as ApiError;
        toast.error(err.error?.message ?? "사진을 업로드하지 못했어요.", {
          id: "photo-upload",
        });
        setSubmitting(false);
        return;
      }
      toast.success(`사진 ${files.length}장을 공유했습니다.`, {
        id: "photo-upload",
      });
      handleClose();
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "사진 처리에 실패했어요.";
      toast.error(msg, { id: "photo-upload" });
      setSubmitting(false);
    }
  };

  const isHero = variant === "hero";
  const buttonClass =
    variant === "primary"
      ? "bg-[var(--color-gold-soft)] text-ink hover:brightness-[1.03] shadow-card"
      : variant === "hero"
        ? "bg-burgundy text-paper hover:opacity-90 shadow-card w-full"
        : "border-line bg-paper text-ink hover:bg-cream-100";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={[
          isHero
            ? "inline-flex h-12 items-center justify-center gap-1.5 rounded-xl px-5 text-[14px] font-medium tracking-[-0.01em] transition-opacity"
            : "inline-flex h-10 items-center justify-center gap-1.5 rounded-full px-5 text-[13px] font-medium tracking-[-0.01em] transition-[transform,filter,background-color] hover:-translate-y-0.5",
          buttonClass,
        ].join(" ")}
        style={variant === "ghost" ? { borderWidth: "0.5px" } : undefined}
        data-testid="photo-upload-button"
      >
        <i
          className={
            isHero ? "ti ti-camera-plus text-[16px]" : "ti ti-camera text-[15px]"
          }
          aria-hidden
        />
        {label}
      </button>

      <dialog
        ref={dialogRef}
        onCancel={(e) => {
          e.preventDefault();
          handleClose();
        }}
        onClose={handleClose}
        className="bg-paper border-line m-auto w-[min(420px,calc(100%-2rem))] rounded-2xl border p-0 backdrop:bg-black/45"
        style={{ borderWidth: "0.5px" }}
        data-testid="photo-dialog"
      >
        <div className="relative px-6 pt-7 pb-6">
          <button
            type="button"
            onClick={handleClose}
            aria-label="닫기"
            className="text-muted hover:text-ink absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full transition-colors"
            data-testid="photo-dialog-close"
          >
            <i className="ti ti-x text-[18px]" />
          </button>

          <div className="text-center">
            <p className="text-gold text-[11px] font-medium tracking-[0.3em] uppercase">
              Photo
            </p>
            <h2 className="font-serif-ko text-ink mt-2 text-[20px] font-semibold tracking-[-0.01em]">
              사진 올리기
            </h2>
            <p className="text-muted mt-1.5 text-[13px] leading-[1.6]">
              공연 현장에서 찍은 사진을 다른 관객과 함께 나눠 주세요.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-muted text-[12px] tracking-[-0.01em]">
                닉네임 ({nickname.length}/{NICK_MAX})
              </span>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={NICK_MAX}
                minLength={NICK_MIN}
                required
                placeholder="예: 어울림 팬"
                className="border-line text-ink focus:border-gold focus:ring-gold/20 w-full rounded-lg bg-white px-3 py-2.5 text-[14px] outline-none focus:ring-2"
                style={{ borderWidth: "0.5px" }}
                data-testid="photo-input-nickname"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-muted text-[12px] tracking-[-0.01em]">
                캡션 (선택, {caption.length}/{CAPTION_MAX})
              </span>
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                maxLength={CAPTION_MAX}
                placeholder="예: 무대 위 앙상블"
                className="border-line text-ink focus:border-gold focus:ring-gold/20 w-full rounded-lg bg-white px-3 py-2.5 text-[14px] outline-none focus:ring-2"
                style={{ borderWidth: "0.5px" }}
                data-testid="photo-input-caption"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-muted text-[12px] tracking-[-0.01em]">
                사진 (1–{MAX_FILES}장, JPG/PNG/HEIC)
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.heic,.heif"
                multiple
                onChange={handleFileChange}
                required
                className="text-ink file:border-line file:bg-cream-100 file:text-ink hover:file:bg-cream-200 cursor-pointer rounded-lg text-[13px] file:mr-3 file:rounded-md file:border file:px-3 file:py-1.5 file:text-[12px] file:font-medium"
                style={{ borderWidth: "0.5px" }}
                data-testid="photo-input-files"
              />
              {previews.length > 0 && (
                <ul
                  className="mt-2 grid grid-cols-3 gap-1.5"
                  data-testid="photo-preview-list"
                >
                  {previews.map((src, i) => (
                    <li
                      key={src}
                      className="border-line aspect-square overflow-hidden rounded-lg border"
                      style={{ borderWidth: "0.5px" }}
                    >
                      {/* Preview only — Blob URL not optimized via next/image */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={src}
                        alt={`미리보기 ${i + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </li>
                  ))}
                </ul>
              )}
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="bg-ink text-paper mt-1 inline-flex w-full items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-[14px] font-medium tracking-[-0.01em] transition-opacity hover:opacity-90 disabled:opacity-50"
              data-testid="photo-submit"
            >
              {submitting ? "처리 중…" : "올리기"}
            </button>
          </form>
          <p className="text-muted-light mt-3 text-center text-[11px] leading-[1.5]">
            올린 사진은 즉시 공개되며, 위치 정보는 자동으로 제거됩니다.
          </p>
        </div>
      </dialog>
    </>
  );
};

export default PhotoUploadButton;
