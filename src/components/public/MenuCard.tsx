import Link from "next/link";
import { type FC, type ReactNode } from "react";
import CornerMarker from "@/components/ui/CornerMarker";

interface MenuCardProps {
  href: string;
  /** Roman numeral eyebrow ("I", "II", …) — wrapped as `— I —` automatically. */
  num: string;
  title: string;
  /** English description shown below the title in italic. */
  desc: string;
  /** Inline SVG (already sized for the 48-px circular badge). */
  icon: ReactNode;
}

/**
 * Reference HTML lines 274-358, 968-985 — primary menu card used on the home
 * page. Decorated with four CornerMarker, a circular gold-bordered icon, a
 * Cormorant numeral eyebrow, the Korean title, an English description, and a
 * trailing arrow that nudges right on hover.
 */
const MenuCard: FC<MenuCardProps> = ({ href, num, title, desc, icon }) => (
  <Link
    href={href}
    data-testid="menu-card"
    data-menu-href={href}
    className="group border-gold/30 hover:border-gold relative block overflow-hidden rounded-[2px] border bg-gradient-to-br from-[rgba(26,26,31,0.9)] to-[rgba(20,16,12,0.95)] px-[22px] py-6 text-left backdrop-blur-md transition-all duration-500 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_-8px_rgba(197,165,114,0.3)]"
  >
    <CornerMarker />

    {/* Sweep highlight (HTML lines 289-295) */}
    <span
      aria-hidden
      className="pointer-events-none absolute top-0 -left-full h-full w-full bg-gradient-to-r from-transparent via-[rgba(197,165,114,0.08)] to-transparent transition-[left] duration-700 ease-in-out group-hover:left-full"
    />

    <div className="relative z-[2] flex items-center gap-[18px]">
      <span className="border-gold text-gold group-hover:bg-gold group-hover:text-ink flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-all duration-500 group-hover:rotate-[360deg] sm:h-12 sm:w-12">
        {icon}
      </span>
      <div className="flex-1">
        <p className="font-serif-en text-gold mb-0.5 text-[11px] tracking-[0.3em] italic">
          — {num} —
        </p>
        <p className="font-serif-ko text-paper mb-0.5 text-base tracking-[0.08em] sm:text-[18px]">
          {title}
        </p>
        <p className="font-serif-en text-paper/50 text-[13px] tracking-[0.03em] italic">
          {desc}
        </p>
      </div>
      <span
        aria-hidden
        className="font-serif-en text-gold text-2xl transition-transform duration-400 group-hover:translate-x-1.5"
      >
        →
      </span>
    </div>
  </Link>
);

export default MenuCard;
