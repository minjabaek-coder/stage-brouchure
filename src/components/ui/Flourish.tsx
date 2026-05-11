import { type FC } from "react";

interface FlourishProps {
  className?: string;
}

/**
 * Reference HTML lines 372-376, 1009 — single `❦` used in the footer.
 */
const Flourish: FC<FlourishProps> = ({ className }) => (
  <div
    aria-hidden
    className={["text-gold mb-2 text-[18px]", className ?? ""].join(" ").trim()}
  >
    ❦
  </div>
);

export default Flourish;
