import { type FC } from "react";
import Flourish from "@/components/ui/Flourish";
import { EVENT } from "@/lib/event";

/**
 * Reference HTML lines 360-383, 1008-1012 — flourish + welcome line + organizer.
 */
const HomeFooter: FC = () => (
  <footer
    className="font-serif-en text-paper/40 mt-12 border-t border-[rgba(197,165,114,0.15)] pt-6 text-center text-[11px] tracking-[0.2em] italic"
    data-testid="home-footer"
  >
    <Flourish />
    <p>{EVENT.welcomeEn}</p>
    <p className="font-serif-ko text-paper/50 mt-1.5 text-[11px] not-italic">
      {EVENT.organizer}
    </p>
  </footer>
);

export default HomeFooter;
