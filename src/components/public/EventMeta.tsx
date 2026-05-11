import { Fragment, type FC } from "react";
import MetaDivider from "@/components/ui/MetaDivider";
import { EVENT } from "@/lib/event";

const META_ITEMS = [
  { label: "DATE", value: EVENT.date },
  { label: "VENUE", value: EVENT.venue },
  { label: "TIME", value: EVENT.time },
] as const;

// axe-core canonical pattern: <dl> 의 직계 자식은 <dt>/<dd> 그룹 또는
// <div>(이 안에 dt/dd 1쌍). display:contents 로 wrapper 를 a11y 트리에서
// 지우면 dlitem 룰이 깨지므로 사용하지 않는다.
const EventMeta: FC = () => (
  <dl className="flex items-stretch justify-center gap-3 py-4 sm:gap-5">
    {META_ITEMS.map((item, idx) => (
      <Fragment key={item.label}>
        {idx > 0 && <MetaDivider />}
        <div className="flex flex-col items-center gap-1 px-1">
          <dt className="text-gold text-[9px] tracking-[0.4em]">
            {item.label}
          </dt>
          <dd className="font-serif-en text-paper text-[13px] tracking-[0.08em] sm:text-[15px]">
            {item.value}
          </dd>
        </div>
      </Fragment>
    ))}
  </dl>
);

export default EventMeta;
