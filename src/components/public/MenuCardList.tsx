import { type FC } from "react";
import MenuCard from "@/components/public/MenuCard";
import { EVENT } from "@/lib/event";

/**
 * Vertical stack of the two primary navigation cards (Chapter cards).
 */
const MenuCardList: FC = () => (
  <nav
    className="pt-3 pb-8"
    aria-label="메인 메뉴"
    data-testid="menu-card-list"
  >
    <MenuCard
      href="/search"
      testId="menu-card-search"
      title={EVENT.chapterSearchTitle}
      desc={EVENT.chapterSearchDesc}
    />
    <MenuCard
      href="/brochure"
      testId="menu-card-brochure"
      title={
        <>
          {EVENT.chapterBrochureTitle}
          <span className="ml-1 text-[18px] font-normal text-[#8C7958]">
            {EVENT.chapterBrochureSub}
          </span>
        </>
      }
      desc={EVENT.chapterBrochureDesc}
    />
  </nav>
);

export default MenuCardList;
