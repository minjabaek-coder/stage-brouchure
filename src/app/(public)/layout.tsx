import { type ReactNode } from "react";
import ShareFab from "@/components/public/ShareFab";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";

/**
 * Public route layout. Hosts the global ShareFab so /, /search, /brochure
 * all get the floating share button without /admin inheriting it.
 * The FAB is fixed-positioned, so its DOM position relative to each page
 * does not matter — it's a sibling to whatever Stage each page renders.
 */
export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <ShareFab shareUrl={SITE_URL} />
    </>
  );
}
