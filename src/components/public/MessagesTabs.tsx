"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { type ReactNode } from "react";

type TabKey = "cheer" | "review" | "photos";

interface MessagesTabsProps {
  cheerPanel: ReactNode;
  reviewPanel: ReactNode;
  photosPanel: ReactNode;
}

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: "cheer", label: "응원 메시지" },
  { key: "review", label: "관람 후기" },
  { key: "photos", label: "사진" },
];

const VALID_TABS = new Set<TabKey>(["cheer", "review", "photos"]);

function parseTab(raw: string | null): TabKey {
  if (raw && VALID_TABS.has(raw as TabKey)) return raw as TabKey;
  return "cheer";
}

/**
 * 3-tab navigation for /messages. The cheer tab is the implemented panel
 * (SSR-rendered messages list passed in as `cheerPanel`); review/photos
 * panels are coming-soon placeholders until after the concert (PRD §7).
 *
 * Tab state lives in the URL (`?tab=cheer|review|photos`) so it survives
 * refresh, back/forward, and direct linking. The default tab (`cheer`)
 * uses no query param to keep the canonical `/messages` URL clean.
 */
const MessagesTabs = ({
  cheerPanel,
  reviewPanel,
  photosPanel,
}: MessagesTabsProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const active = parseTab(searchParams.get("tab"));

  const panels: Record<TabKey, ReactNode> = {
    cheer: cheerPanel,
    review: reviewPanel,
    photos: photosPanel,
  };

  const handleSelect = (key: TabKey) => {
    if (key === active) return;
    const params = new URLSearchParams(searchParams.toString());
    if (key === "cheer") params.delete("tab");
    else params.set("tab", key);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  };

  return (
    <div data-testid="messages-tabs">
      <div
        role="tablist"
        aria-label="응원 메시지 / 관람 후기 / 사진"
        className="border-line mb-6 flex"
        style={{ borderBottomWidth: "0.5px" }}
      >
        {TABS.map((tab) => {
          const isActive = active === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => handleSelect(tab.key)}
              className={[
                "relative flex-1 px-2 py-3 text-[14px] font-medium tracking-[-0.01em] transition-colors",
                isActive ? "text-ink" : "text-muted hover:text-ink",
              ].join(" ")}
              data-testid={`messages-tab-${tab.key}`}
            >
              {tab.label}
              {isActive && (
                <span
                  aria-hidden
                  className="bg-burgundy absolute right-2 bottom-[-1px] left-2 h-[2px] rounded-full"
                />
              )}
            </button>
          );
        })}
      </div>
      <div role="tabpanel">{panels[active]}</div>
    </div>
  );
};

export default MessagesTabs;
