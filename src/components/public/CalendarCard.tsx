"use client";

import { type FC, useState } from "react";
import CalendarDialog from "@/components/public/CalendarDialog";

/**
 * Square card paired with DDayCard. Clicking the card opens a dialog that
 * offers .ics download and a Google Calendar deeplink.
 */
const CalendarCard: FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="캘린더에 추가하기"
        className="border-line bg-paper hover:bg-cream-100 flex h-24 w-24 shrink-0 flex-col items-center justify-center gap-1 rounded-2xl transition-[background-color,transform] hover:-translate-y-0.5"
        style={{ borderWidth: "0.5px" }}
        data-testid="calendar-card"
      >
        <i
          className="ti ti-calendar-plus text-burgundy text-[20px]"
          aria-hidden
        />
        <span className="font-serif-ko text-ink text-[13px] leading-none font-medium tracking-[-0.01em]">
          캘린더 추가
        </span>
      </button>

      <CalendarDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
};

export default CalendarCard;
