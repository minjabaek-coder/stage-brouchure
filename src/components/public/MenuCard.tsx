import Link from "next/link";
import { type FC, type ReactNode } from "react";

interface MenuCardProps {
  href: string;
  title: ReactNode;
  desc: string;
  testId?: string;
}

/**
 * Light-theme chapter card. Cream gradient + hairline gold rule + circular
 * arrow button. Source: docs/assets/어울림콘서트_260512.html .chapter.
 */
const MenuCard: FC<MenuCardProps> = ({ href, title, desc, testId }) => (
  <Link
    href={href}
    data-testid={testId ?? "menu-card"}
    className="border-gold/25 hover:shadow-card group relative mb-3 flex items-center justify-between overflow-hidden rounded-2xl border bg-[linear-gradient(180deg,#FBF6EB_0%,#F5EFE2_100%)] px-[26px] py-7 transition-[transform,box-shadow] duration-200 hover:translate-x-0.5"
    style={{ borderWidth: "0.5px" }}
  >
    <span
      aria-hidden
      className="bg-gold absolute top-[22px] left-[26px] h-px w-7"
    />
    <div>
      <h3 className="font-serif-ko mt-3.5 mb-2 text-[28px] leading-[1.2] font-semibold tracking-[-0.015em] text-[#1A1410]">
        {title}
      </h3>
      <p className="font-serif-ko text-[15px] leading-[1.5] font-normal text-[#6B5A3F]">
        {desc}
      </p>
    </div>
    <span
      aria-hidden
      className="border-gold/40 ml-3.5 flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-full border bg-white/60"
      style={{ borderWidth: "0.5px" }}
    >
      <i className="ti ti-arrow-right text-burgundy text-[20px]" />
    </span>
  </Link>
);

export default MenuCard;
