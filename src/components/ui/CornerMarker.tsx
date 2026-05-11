import { type FC } from "react";

/**
 * Reference HTML lines 301-309, 969-970 — four 12×12 gold L-marks placed at
 * each corner of a parent (which must be `relative`). Mounted as a single
 * component so callers don't repeat the four spans by hand.
 */
const CornerMarker: FC = () => (
  <>
    <span
      aria-hidden
      className="border-gold pointer-events-none absolute top-2 left-2 h-3 w-3 border-t border-l"
    />
    <span
      aria-hidden
      className="border-gold pointer-events-none absolute top-2 right-2 h-3 w-3 border-t border-r"
    />
    <span
      aria-hidden
      className="border-gold pointer-events-none absolute bottom-2 left-2 h-3 w-3 border-b border-l"
    />
    <span
      aria-hidden
      className="border-gold pointer-events-none absolute right-2 bottom-2 h-3 w-3 border-r border-b"
    />
  </>
);

export default CornerMarker;
