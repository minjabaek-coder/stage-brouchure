import Link from "next/link";
import { type FC } from "react";

interface BackButtonProps {
  /** Where to navigate. Defaults to home. */
  href?: string;
  label?: string;
}

/**
 * Reference HTML lines 411-421, 1019, 1088 — circular ← back button used in
 * page headers. Renders as a `next/link` so the in-app navigation is instant.
 */
const BackButton: FC<BackButtonProps> = ({ href = "/", label = "뒤로 가기" }) => (
  <Link
    href={href}
    aria-label={label}
    data-testid="back-button"
    className="border-gold/40 text-gold hover:bg-gold hover:text-ink flex h-10 w-10 items-center justify-center rounded-full border bg-transparent text-[18px] transition-colors duration-300"
  >
    ←
  </Link>
);

export default BackButton;
