import { type FC } from "react";
import MenuCard from "@/components/public/MenuCard";

const SearchIcon: FC = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    aria-hidden
  >
    <circle cx="11" cy="11" r="7" />
    <line x1="16.5" y1="16.5" x2="21" y2="21" strokeLinecap="round" />
  </svg>
);

const BrochureIcon: FC = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    aria-hidden
  >
    <path d="M4 4h7a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4z" />
    <path d="M20 4h-7a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h8z" />
  </svg>
);

/**
 * Reference HTML lines 269-273, 966-1006 — vertical stack of the two primary
 * navigation cards on the home page. fadeUp staggers behind the header/video.
 */
const MenuCardList: FC = () => (
  <nav
    className="animate-fade-up mt-8 flex flex-col gap-3.5"
    style={{ animationDelay: "0.2s" }}
    aria-label="메인 메뉴"
    data-testid="menu-card-list"
  >
    <MenuCard
      href="/search"
      num="I"
      title="자리 찾기"
      desc="Find Your Seat"
      icon={<SearchIcon />}
    />
    <MenuCard
      href="/brochure"
      num="II"
      title="브로셔"
      desc="Programme & Notes"
      icon={<BrochureIcon />}
    />
  </nav>
);

export default MenuCardList;
