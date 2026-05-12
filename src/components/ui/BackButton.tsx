import Link from "next/link";
import { type FC } from "react";

interface BackButtonProps {
  /** Where to navigate. Defaults to home. */
  href?: string;
  label?: string;
}

/** Light-theme circular back button (← arrow icon). */
const BackButton: FC<BackButtonProps> = ({ href = "/", label = "뒤로 가기" }) => (
  <Link
    href={href}
    aria-label={label}
    data-testid="back-button"
    className="border-line text-ink hover:bg-cream-100 flex h-10 w-10 items-center justify-center rounded-full border bg-white transition-colors"
    style={{ borderWidth: "0.5px" }}
  >
    <i className="ti ti-arrow-left text-[18px]" />
  </Link>
);

export default BackButton;
