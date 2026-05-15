import Link from "next/link";
import { type FC } from "react";

interface AdminNavProps {
  /** "콘텐츠 관리" or "방명록 관리" — which tab is currently rendered. */
  active: "content" | "messages";
}

/**
 * Two-link top nav for the admin area. Renders unauth (PRD §3.1).
 * /admin/messages is a sibling route under the same ADMIN_PATH_SUFFIX
 * obfuscation handled by middleware.
 */
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
        href="/admin"
        className={linkClass("content")}
        data-testid="admin-nav-content"
      >
        콘텐츠 관리
      </Link>
      <Link
        href="/admin/messages"
        className={linkClass("messages")}
        data-testid="admin-nav-messages"
      >
        방명록 관리
      </Link>
    </nav>
  );
};

export default AdminNav;
