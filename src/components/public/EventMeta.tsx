import { type FC } from "react";
import { EVENT } from "@/lib/event";

/**
 * 3-column meta strip — date / time / venue.
 * Source: docs/assets/어울림콘서트_260512.html .meta-strip.
 */
const EventMeta: FC = () => (
  <dl
    className="border-line mt-8 grid grid-cols-[auto_auto_1fr] items-start gap-0 border-t border-b py-[22px]"
    style={{ borderTopWidth: "0.5px", borderBottomWidth: "0.5px" }}
    data-testid="event-meta"
  >
    <div className="px-1.5">
      <dt className="text-muted mb-1.5 text-[12px] font-normal">
        {EVENT.dateLabel}
      </dt>
      <dd className="text-ink text-[15px] leading-[1.35] font-medium tracking-[-0.03em] whitespace-nowrap">
        {EVENT.dateValue}
        <small className="text-muted ml-0.5 text-[11px] font-normal">
          {EVENT.dateDay}
        </small>
      </dd>
    </div>
    <div
      className="border-line ml-1.5 px-1.5 pl-3"
      style={{ borderLeftWidth: "0.5px" }}
    >
      <dt className="text-muted mb-1.5 text-[12px] font-normal">
        {EVENT.timeLabel}
      </dt>
      <dd className="text-ink text-[15px] leading-[1.35] font-medium tracking-[-0.03em] whitespace-nowrap">
        {EVENT.timeValue}
      </dd>
    </div>
    <div
      className="border-line ml-1.5 px-1.5 pl-3"
      style={{ borderLeftWidth: "0.5px" }}
    >
      <dt className="text-muted mb-1.5 text-[12px] font-normal">
        {EVENT.venueLabel}
      </dt>
      <dd className="text-ink text-[15px] leading-[1.35] font-medium tracking-[-0.03em] whitespace-nowrap">
        {EVENT.venueShort}
      </dd>
    </div>
  </dl>
);

export default EventMeta;
