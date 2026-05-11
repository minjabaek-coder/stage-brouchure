import { type FC } from "react";

interface OrnamentProps {
  className?: string;
}

/**
 * Reference HTML lines 76-84, 919 — `❦ ✦ ❦` decorative trio used above the
 * home header pre-title. Cormorant italic + 0.5em letter-spacing.
 */
const Ornament: FC<OrnamentProps> = ({ className }) => (
  <div
    aria-hidden
    className={[
      "font-serif-en text-gold mb-[18px] text-[14px] tracking-[0.5em] italic",
      className ?? "",
    ]
      .join(" ")
      .trim()}
  >
    <span>❦</span> <span>✦</span> <span>❦</span>
  </div>
);

export default Ornament;
