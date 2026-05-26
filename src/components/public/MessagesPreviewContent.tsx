"use client";

import Link from "next/link";
import { type ReactNode, useState } from "react";

type TabKey = "cheer" | "review" | "photos";

interface MessagesPreviewContentProps {
  cheerPanel: ReactNode;
  reviewPanel: ReactNode;
  photosPanel: ReactNode;
  cheerCta: ReactNode;
  reviewCta: ReactNode;
  photosCta: ReactNode;
}

const TABS: Array<{ key: TabKey; label: string; href: string }> = [
  { key: "cheer", label: "응원 메시지", href: "/messages" },
  { key: "review", label: "관람 후기", href: "/messages?tab=review" },
  { key: "photos", label: "사진", href: "/messages?tab=photos" },
];

/**
 * Home-page tab switcher. Unlike `/messages` (URL-persisted state), this
 * keeps state in React only — the home URL stays `/` regardless of which
 * teaser tab is active. The full page handles deep-linkable tab state.
 *
 * The chip below the menu cards used to be a row of 3 server-rendered
 * `<Link>` elements that all jumped to /messages. Now they toggle local
 * state, and only the "전체 보기" link below navigates.
 */
const MessagesPreviewContent = ({
  cheerPanel,
  reviewPanel,
  photosPanel,
  cheerCta,
  reviewCta,
  photosCta,
}: MessagesPreviewContentProps) => {
  const [active, setActive] = useState<TabKey>("cheer");

  const panels: Record<TabKey, ReactNode> = {
    cheer: cheerPanel,
    review: reviewPanel,
    photos: photosPanel,
  };

  const ctas: Record<TabKey, ReactNode> = {
    cheer: cheerCta,
    review: reviewCta,
    photos: photosCta,
  };

  const activeTab = TABS.find((t) => t.key === active)!;

  return (
    <>
      <nav
        role="tablist"
        aria-label="응원 메시지 / 관람 후기 / 사진"
        className="mb-4 flex items-center justify-center gap-1.5"
        data-testid="messages-preview-nav"
      >
        {TABS.map((tab) => {
          const isActive = active === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(tab.key)}
              className={[
                "inline-flex items-center rounded-full px-3 py-1.5 text-[12px] font-medium tracking-[-0.01em] transition-colors",
                isActive
                  ? "border-line bg-cream-100 text-ink border"
                  : "text-muted hover:text-ink hover:bg-cream-100",
              ].join(" ")}
              style={isActive ? { borderWidth: "0.5px" } : undefined}
              data-testid={`messages-preview-tab-${tab.key}`}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>

      <div role="tabpanel" data-testid={`messages-preview-panel-${active}`}>
        {panels[active]}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        {ctas[active]}
        <Link
          href={activeTab.href}
          className="text-ink hover:text-burgundy inline-flex items-center gap-1 text-[13px] font-medium tracking-[-0.01em]"
          data-testid="messages-see-all"
        >
          전체 보기
          <i className="ti ti-arrow-right text-[14px]" aria-hidden />
        </Link>
      </div>
    </>
  );
};

export default MessagesPreviewContent;
