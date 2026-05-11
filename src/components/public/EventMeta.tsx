import { type FC } from "react";
import MetaDivider from "@/components/ui/MetaDivider";
import { EVENT } from "@/lib/event";

/**
 * Reference HTML lines 128-148, 924-939 — DATE / VENUE / TIME triple separated
 * by 1px gold dividers. Labels in tiny gold tracking, values in Cormorant.
 */
const META_ITEMS = [
  { label: "DATE", value: EVENT.date },
  { label: "VENUE", value: EVENT.venue },
  { label: "TIME", value: EVENT.time },
] as const;

const EventMeta: FC = () => (
  <dl className="flex items-stretch justify-center gap-3 py-4 sm:gap-5">
    {META_ITEMS.map((item, idx) => (
      <div key={item.label} className="contents">
        {idx > 0 && <MetaDivider />}
        <div className="flex flex-col items-center gap-1 px-1">
          <dt className="text-gold text-[9px] tracking-[0.4em]">
            {item.label}
          </dt>
          <dd className="font-serif-en text-paper text-[13px] tracking-[0.08em] sm:text-[15px]">
            {item.value}
          </dd>
        </div>
      </div>
    ))}
  </dl>
);

export default EventMeta;
