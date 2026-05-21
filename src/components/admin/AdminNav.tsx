import Link from "next/link";
import { type FC } from "react";

interface AdminNavProps {
  /** "콘텐츠 관리" or "응원 메시지 관리" — which tab is currently rendered. */
  active: "content" | "messages";
}

/**
 * Two-link top nav for the admin area. Renders unauth (PRD §3.1).
 *
 * Path obfuscation: when ADMIN_PATH_SUFFIX is set (production), the only
 * reachable admin URL is `/admin-<suffix>`. The middleware internally
 * rewrites that to `/admin*` before Next.js routes it, but the browser URL
 * must keep the suffix — so links here include it. Without the suffix
 * (local dev/test), the bare `/admin*` paths are used.
 */
const SUFFIX = (process.env.ADMIN_PATH_SUFFIX ?? "").trim();
const ADMIN_BASE = SUFFIX ? `/admin-${SUFFIX}` : "/admin";

const AdminNav: FC<AdminNavProps> = ({ active }) => {
  const linkClass = (key: "content" | "messages") =>
    [
      "flex-1 rounded-full py-2 text-center text-[13px] font-medium tracking-[-0.01em] transition-colors",
      key === active
        ? "bg-ink text-paper"
        : "text-muted hover:text-ink",
    ].join(" ");

  return (
    <nav
      className="border-line bg-paper mx-auto mb-6 flex max-w-[360px] gap-1 rounded-full p-1"
      style={{ borderWidth: "0.5px" }}
      data-testid="admin-nav"
    >
      <Link
        href={ADMIN_BASE}
        className={linkClass("content")}
        data-testid="admin-nav-content"
      >
        콘텐츠 관리
      </Link>
      <Link
        href={`${ADMIN_BASE}/messages`}
        className={linkClass("messages")}
        data-testid="admin-nav-messages"
      >
        응원 메시지 관리
      </Link>
    </nav>
  );
};

export default AdminNav;
