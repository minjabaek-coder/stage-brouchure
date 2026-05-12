import { type FC } from "react";

interface AdminStatusBarProps {
  attendeeCount: number;
  lastCsvUpload: Date | null;
  lastSeatMapUpload: Date | null;
  lastBrochureUpload: Date | null;
}

function fmt(d: Date | null): string {
  if (!d) return "—";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Light-theme top-of-page summary for /admin. */
const AdminStatusBar: FC<AdminStatusBarProps> = ({
  attendeeCount,
  lastCsvUpload,
  lastSeatMapUpload,
  lastBrochureUpload,
}) => (
  <dl
    className="border-line bg-paper mt-2 grid grid-cols-2 gap-x-4 gap-y-3 rounded-xl border px-5 py-5 sm:grid-cols-4"
    style={{ borderWidth: "0.5px" }}
    data-testid="admin-status-bar"
  >
    <div>
      <dt className="text-gold text-[10px] font-medium tracking-[0.3em] uppercase">
        Attendees
      </dt>
      <dd
        className="font-serif-ko text-ink mt-1 text-[18px] font-medium"
        data-testid="status-attendees"
      >
        현재 등록: {attendeeCount}명
      </dd>
    </div>
    <div>
      <dt className="text-gold text-[10px] font-medium tracking-[0.3em] uppercase">
        CSV
      </dt>
      <dd
        className="text-muted mt-1 text-[13px]"
        data-testid="status-csv-time"
      >
        {fmt(lastCsvUpload)}
      </dd>
    </div>
    <div>
      <dt className="text-gold text-[10px] font-medium tracking-[0.3em] uppercase">
        Seat Map
      </dt>
      <dd
        className="text-muted mt-1 text-[13px]"
        data-testid="status-seatmap-time"
      >
        {fmt(lastSeatMapUpload)}
      </dd>
    </div>
    <div>
      <dt className="text-gold text-[10px] font-medium tracking-[0.3em] uppercase">
        Brochure
      </dt>
      <dd
        className="text-muted mt-1 text-[13px]"
        data-testid="status-brochure-time"
      >
        {fmt(lastBrochureUpload)}
      </dd>
    </div>
  </dl>
);

export default AdminStatusBar;
