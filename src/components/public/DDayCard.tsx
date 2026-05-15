"use client";

import { type FC, useSyncExternalStore } from "react";
import { EVENT } from "@/lib/event";

/**
 * KST-aware D-day countdown.
 *  D-XX   when today (KST) is before EVENT.eventDateIso
 *  D-DAY  when today (KST) equals EVENT.eventDateIso (full calendar day)
 *  종료   when today (KST) is after EVENT.eventDateIso
 *
 * useSyncExternalStore avoids hydration mismatch warnings: the server
 * snapshot is a fixed placeholder and the client snapshot reflects the
 * actual KST today. React intentionally renders both without flagging.
 */

const subscribeNoop = () => () => {};
const SSR_PLACEHOLDER = "ssr";

function getKstYmd(): string {
  const now = new Date();
  const kstMs = now.getTime() + 9 * 60 * 60 * 1000;
  const kst = new Date(kstMs);
  const y = kst.getUTCFullYear();
  const m = String(kst.getUTCMonth() + 1).padStart(2, "0");
  const d = String(kst.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function diffDaysFromEvent(todayYmd: string): number {
  const eventStart = new Date(EVENT.eventDateIso + "T00:00:00+09:00").getTime();
  const todayStart = new Date(todayYmd + "T00:00:00+09:00").getTime();
  return Math.round((eventStart - todayStart) / 86_400_000);
}

type DDayState =
  | { kind: "before"; days: number }
  | { kind: "day" }
  | { kind: "after" }
  | { kind: "ssr" };

function computeState(todayYmd: string): DDayState {
  if (todayYmd === SSR_PLACEHOLDER) return { kind: "ssr" };
  const diff = diffDaysFromEvent(todayYmd);
  if (diff > 0) return { kind: "before", days: diff };
  if (diff === 0) return { kind: "day" };
  return { kind: "after" };
}

const DDayCard: FC = () => {
  const todayYmd = useSyncExternalStore(
    subscribeNoop,
    getKstYmd,
    () => SSR_PLACEHOLDER,
  );
  const state = computeState(todayYmd);

  const isDay = state.kind === "day";
  const isAfter = state.kind === "after";

  return (
    <div
      className={[
        "border-line flex h-24 min-w-0 flex-1 flex-col items-center justify-center rounded-2xl",
        isDay
          ? "bg-[var(--color-gold-soft)]"
          : isAfter
            ? "bg-surface"
            : "bg-cream-100",
      ].join(" ")}
      style={{ borderWidth: "0.5px" }}
      data-testid="dday-card"
    >
      {!isAfter && <span aria-hidden className="bg-gold/40 mb-1.5 h-px w-7" />}

      {state.kind === "before" && (
        <>
          <span
            className="font-serif-en text-ink leading-none font-medium tracking-[-0.02em]"
            style={{ fontSize: "44px" }}
            data-testid="dday-value"
          >
            D-{state.days}
          </span>
          <span className="text-muted mt-1.5 text-[11px] tracking-[0.18em] uppercase">
            공연까지
          </span>
        </>
      )}

      {state.kind === "day" && (
        <>
          <span
            className="font-serif-en text-ink leading-none font-semibold tracking-[-0.02em]"
            style={{ fontSize: "36px" }}
            data-testid="dday-value"
          >
            D-DAY
          </span>
          <span className="text-ink mt-1.5 text-[11px] tracking-[0.18em] uppercase">
            오늘 공연
          </span>
        </>
      )}

      {state.kind === "after" && (
        <p
          className="text-muted px-3 text-center text-[13px] leading-[1.45]"
          data-testid="dday-value"
        >
          연주회가
          <br />
          종료되었습니다.
        </p>
      )}

      {state.kind === "ssr" && (
        <span
          className="text-muted-light text-[12px]"
          data-testid="dday-value"
        >
          …
        </span>
      )}
    </div>
  );
};

export default DDayCard;
