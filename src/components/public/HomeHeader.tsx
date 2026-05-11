import { type FC } from "react";
import Ornament from "@/components/ui/Ornament";
import EventMeta from "@/components/public/EventMeta";
import { EVENT } from "@/lib/event";

/**
 * Reference HTML lines 60-148 (.header), 918-940 — full home header composition:
 * Ornament → PreTitle → TitleEn → TitleKo (with gold-gradient highlight) →
 * Subtitle → EventMeta. fadeUp entrance + bottom gold underline (after pseudo).
 */
const HomeHeader: FC = () => (
  <header
    className="animate-fade-up relative border-b border-[rgba(197,165,114,0.25)] pt-8 pb-6 text-center after:absolute after:bottom-[-1px] after:left-1/2 after:h-px after:w-20 after:-translate-x-1/2 after:bg-[var(--color-gold)] after:shadow-[0_0_12px_var(--color-gold)] after:content-['']"
    data-testid="home-header"
  >
    <Ornament />

    <p className="font-serif-ko text-paper/55 mb-3.5 text-[13px] font-light tracking-[0.2em]">
      {EVENT.preTitle}
    </p>

    <p className="font-serif-en text-gold-hi mb-2 text-[18px] font-light tracking-[0.3em] uppercase italic">
      {EVENT.titleEn}
    </p>

    <h1 className="font-serif-ko text-paper mb-5 text-[30px] leading-[1.2] font-light tracking-[0.15em] [text-shadow:0_2px_20px_rgba(0,0,0,0.5)] sm:text-[38px]">
      {EVENT.titleKo.replace(EVENT.titleKoHighlight, "").trim()}{" "}
      <strong
        className="from-gold-hi to-gold bg-gradient-to-b bg-clip-text font-medium text-transparent"
        data-testid="title-ko-highlight"
      >
        {EVENT.titleKoHighlight}
      </strong>
    </h1>

    <p className="font-serif-en text-paper/60 mb-6 text-[15px] tracking-[0.05em] italic">
      {EVENT.subtitleEn}
    </p>

    <EventMeta />
  </header>
);

export default HomeHeader;
