"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { type ReactNode } from "react";

type TabKey = "cheer" | "review" | "photos";

interface AdminModerationTabsProps {
  cheerPanel: ReactNode;
  reviewPanel: ReactNode;
  photosPanel: ReactNode;
  cheerCount: number;
  reviewCount: number;
  photoCount: number;
}

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: "cheer", label: "응원 메시지" },
  { key: "review", label: "관람 후기" },
  { key: "photos", label: "사진" },
];

const VALID = new Set<TabKey>(["cheer", "review", "photos"]);

function parseTab(raw: string | null): TabKey {
  if (raw && VALID.has(raw as TabKey)) return raw as TabKey;
  return "cheer";
}

/**
 * Admin moderation tabs for `/admin/messages` — same URL persistence pattern
 * as the public `MessagesTabs`, so deep-linking (`?tab=photos`) survives
 * page refresh. The three panels are passed in fully rendered from the
 * server page so SSR pulls real counts and items.
 */
const AdminModerationTabs = ({
  cheerPanel,
  reviewPanel,
  photosPanel,
  cheerCount,
  reviewCount,
  photoCount,
}: AdminModerationTabsProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const active = parseTab(searchParams.get("tab"));

  const panels: Record<TabKey, ReactNode> = {
    cheer: cheerPanel,
    review: reviewPanel,
    photos: photosPanel,
  };

  const counts: Record<TabKey, number> = {
    cheer: cheerCount,
    review: reviewCount,
    photos: photoCount,
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
    <div data-testid="admin-moderation-tabs">
      <div
        role="tablist"
        aria-label="응원 메시지 / 관람 후기 / 사진"
        className="border-line mb-5 flex"
        style={{ borderBottomWidth: "0.5px" }}
      >
        {TABS.map((tab) => {
          const isActive = active === tab.key;
          const count = counts[tab.key];
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => handleSelect(tab.key)}
              className={[
                "relative flex-1 px-2 py-3 text-[13px] font-medium tracking-[-0.01em] transition-colors",
                isActive ? "text-ink" : "text-muted hover:text-ink",
              ].join(" ")}
              data-testid={`admin-moderation-tab-${tab.key}`}
            >
              {tab.label} ({count})
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

export default AdminModerationTabs;
