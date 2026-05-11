import { type FC } from "react";

interface AdminStatusBarProps {
  attendeeCount: number;
  /** ISO timestamps (or null) from assets / csv_backups updated_at. */
  lastCsvUpload: Date | null;
  lastSeatMapUpload: Date | null;
  lastBrochureUpload: Date | null;
}

function fmt(d: Date | null): string {
  if (!d) return "—";
  // YYYY-MM-DD HH:mm (KST 가정, 행사 1회 단발용이라 별도 TZ 처리 생략)
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * Top-of-page summary for /admin — shows the current attendee count and the
 * last upload timestamp for each asset family so the operator can confirm a
 * fresh upload took effect without leaving the page (FR-A01).
 */
const AdminStatusBar: FC<AdminStatusBarProps> = ({
  attendeeCount,
  lastCsvUpload,
  lastSeatMapUpload,
  lastBrochureUpload,
}) => (
  <dl
    className="border-gold/20 mt-2 grid grid-cols-2 gap-x-4 gap-y-3 rounded-[2px] border bg-[rgba(26,22,18,0.55)] px-5 py-5 sm:grid-cols-4"
    data-testid="admin-status-bar"
  >
    <div>
      <dt className="font-serif-en text-gold text-[10px] tracking-[0.3em] uppercase italic">
        Attendees
      </dt>
      <dd
        className="font-serif-ko text-paper mt-1 text-[20px] tracking-[0.05em]"
        data-testid="status-attendees"
      >
        현재 등록: {attendeeCount}명
      </dd>
    </div>
    <div>
      <dt className="font-serif-en text-gold text-[10px] tracking-[0.3em] uppercase italic">
        CSV
      </dt>
      <dd
        className="font-serif-en text-paper/75 mt-1 text-[13px] tracking-[0.05em]"
        data-testid="status-csv-time"
      >
        {fmt(lastCsvUpload)}
      </dd>
    </div>
    <div>
      <dt className="font-serif-en text-gold text-[10px] tracking-[0.3em] uppercase italic">
        Seat Map
      </dt>
      <dd
        className="font-serif-en text-paper/75 mt-1 text-[13px] tracking-[0.05em]"
        data-testid="status-seatmap-time"
      >
        {fmt(lastSeatMapUpload)}
      </dd>
    </div>
    <div>
      <dt className="font-serif-en text-gold text-[10px] tracking-[0.3em] uppercase italic">
        Brochure
      </dt>
      <dd
        className="font-serif-en text-paper/75 mt-1 text-[13px] tracking-[0.05em]"
        data-testid="status-brochure-time"
      >
        {fmt(lastBrochureUpload)}
      </dd>
    </div>
  </dl>
);

export default AdminStatusBar;
