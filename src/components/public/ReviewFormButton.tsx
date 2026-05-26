"use client";

import { useRouter } from "next/navigation";
import {
  type FC,
  type FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";

interface ReviewFormButtonProps {
  variant?: "primary" | "ghost" | "hero";
  label?: string;
}

const NICK_MIN = 2;
const NICK_MAX = 10;
const BODY_MAX = 500;

interface ApiError {
  error?: { code?: string; message?: string };
}

/**
 * Review form — same shape as MessageFormButton (응원), but the body cap is
 * 500 chars and it posts to /api/reviews. Visual variants/Sizes match so the
 * three tabs share a single Hero CTA pattern.
 */
const ReviewFormButton: FC<ReviewFormButtonProps> = ({
  variant = "primary",
  label = "관람 후기 남기기",
}) => {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [nickname, setNickname] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg) return;
    if (open && !dlg.open) dlg.showModal();
    if (!open && dlg.open) dlg.close();
  }, [open]);

  const reset = () => {
    setNickname("");
    setBody("");
    setSubmitting(false);
  };

  const handleClose = () => {
    setOpen(false);
    reset();
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;
    const trimmedNick = nickname.trim();
    const trimmedBody = body.trim();
    if (trimmedNick.length < NICK_MIN || trimmedNick.length > NICK_MAX) {
      toast.error(`닉네임은 ${NICK_MIN}–${NICK_MAX}자여야 합니다.`);
      return;
    }
    if (trimmedBody.length < 1 || trimmedBody.length > BODY_MAX) {
      toast.error(`후기는 1–${BODY_MAX}자여야 합니다.`);
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname: trimmedNick, body: trimmedBody }),
      });
      if (res.status === 429) {
        toast.error("잠시 후 다시 시도해 주세요. (5분에 1회만 작성 가능)");
        setSubmitting(false);
        return;
      }
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as ApiError;
        toast.error(err.error?.message ?? "후기를 남기지 못했어요.");
        setSubmitting(false);
        return;
      }
      toast.success("후기를 남겼습니다.");
      handleClose();
      router.refresh();
    } catch {
      toast.error("네트워크 오류가 발생했습니다.");
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
        data-testid="review-form-button"
      >
        <i
          className={
            isHero
              ? "ti ti-plus text-[16px]"
              : "ti ti-pencil text-[15px]"
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
        className="bg-paper border-line m-auto w-[min(380px,calc(100%-2rem))] rounded-2xl border p-0 backdrop:bg-black/45"
        style={{ borderWidth: "0.5px" }}
        data-testid="review-dialog"
      >
        <div className="relative px-6 pt-7 pb-6">
          <button
            type="button"
            onClick={handleClose}
            aria-label="닫기"
            className="text-muted hover:text-ink absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full transition-colors"
            data-testid="review-dialog-close"
          >
            <i className="ti ti-x text-[18px]" />
          </button>

          <div className="text-center">
            <p className="text-gold text-[11px] font-medium tracking-[0.3em] uppercase">
              Review
            </p>
            <h2 className="font-serif-ko text-ink mt-2 text-[20px] font-semibold tracking-[-0.01em]">
              관람 후기 남기기
            </h2>
            <p className="text-muted mt-1.5 text-[13px] leading-[1.6]">
              공연을 함께한 감상을 자유롭게 적어 주세요.
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
                data-testid="review-input-nickname"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-muted text-[12px] tracking-[-0.01em]">
                후기 ({body.length}/{BODY_MAX})
              </span>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                maxLength={BODY_MAX}
                rows={6}
                required
                placeholder="공연이 어떠셨나요? 인상 깊었던 순간을 자유롭게 적어 주세요."
                className="border-line text-ink focus:border-gold focus:ring-gold/20 w-full resize-none rounded-lg bg-white px-3 py-2.5 text-[14px] leading-[1.5] outline-none focus:ring-2"
                style={{ borderWidth: "0.5px" }}
                data-testid="review-input-body"
              />
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="bg-ink text-paper mt-1 inline-flex w-full items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-[14px] font-medium tracking-[-0.01em] transition-opacity hover:opacity-90 disabled:opacity-50"
              data-testid="review-submit"
            >
              {submitting ? "보내는 중…" : "보내기"}
            </button>
          </form>
          <p className="text-muted-light mt-3 text-center text-[11px] leading-[1.5]">
            남긴 후기는 즉시 공개됩니다.
          </p>
        </div>
      </dialog>
    </>
  );
};

export default ReviewFormButton;
