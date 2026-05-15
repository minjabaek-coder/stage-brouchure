"use client";

import { type FC, useEffect, useRef } from "react";
import { EVENT } from "@/lib/event";
import { buildGoogleCalendarUrl } from "@/lib/calendar";

interface CalendarDialogProps {
  open: boolean;
  onClose: () => void;
}

const CalendarDialog: FC<CalendarDialogProps> = ({ open, onClose }) => {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dlg = ref.current;
    if (!dlg) return;
    if (open && !dlg.open) dlg.showModal();
    if (!open && dlg.open) dlg.close();
  }, [open]);

  const gcalUrl = buildGoogleCalendarUrl();

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
      data-testid="calendar-dialog"
    >
      <div className="relative px-6 pt-7 pb-6 text-center">
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="text-muted hover:text-ink absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full transition-colors"
          data-testid="calendar-dialog-close"
        >
          <i className="ti ti-x text-[18px]" />
        </button>

        <p className="text-gold text-[11px] font-medium tracking-[0.3em] uppercase">
          Save the Date
        </p>
        <h2 className="font-serif-ko text-ink mt-2 text-[20px] font-semibold tracking-[-0.01em]">
          캘린더에 추가하기
        </h2>
        <p className="text-muted mt-1.5 text-[13px] leading-[1.6]">
          {EVENT.titleKo} · {EVENT.dateValue}
          <span className="text-muted-light mx-1.5">·</span>
          {EVENT.timeValue}
        </p>

        <div className="mt-5 flex flex-col gap-2.5">
          <a
            href="/api/calendar.ics"
            download="eoullim-concert-2026-05-26.ics"
            className="border-line bg-cream-100 text-ink inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[14px] font-medium tracking-[-0.01em] transition-[transform,filter] hover:-translate-y-0.5 hover:brightness-[1.02]"
            style={{ borderWidth: "0.5px" }}
            data-testid="calendar-ics"
            onClick={onClose}
          >
            <i className="ti ti-calendar-plus text-[16px]" aria-hidden />
            iPhone · Outlook · 기본 캘린더 (.ics)
          </a>

          <a
            href={gcalUrl}
            target="_blank"
            rel="noopener"
            className="bg-ink text-paper inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[14px] font-medium tracking-[-0.01em] transition-opacity hover:opacity-90"
            data-testid="calendar-google"
            onClick={onClose}
          >
            <i className="ti ti-brand-google-filled text-[16px]" aria-hidden />
            Google 캘린더
          </a>
        </div>

        <p className="text-muted-light mt-4 text-[12px] leading-[1.6]">
          기본 캘린더 (.ics) 는 파일을 열어 등록해 주세요.
        </p>
      </div>
    </dialog>
  );
};

export default CalendarDialog;
