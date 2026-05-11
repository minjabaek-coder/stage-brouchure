import { type FC } from "react";

/**
 * Reference HTML lines 146-148 — 1px-wide vertical divider between meta items
 * (DATE / VENUE / TIME). Translucent gold.
 */
const MetaDivider: FC = () => (
  <div aria-hidden className="w-px self-stretch bg-[rgba(197,165,114,0.3)]" />
);

export default MetaDivider;
