import { NextResponse, type NextRequest } from "next/server";

/**
 * Admin path obfuscation (PRD §3.1 — no auth, security-by-obscurity).
 *
 * When ADMIN_PATH_SUFFIX is empty the bare /admin is the real URL.
 * When set (production), only /admin-<suffix> is reachable and a request to
 * the bare /admin returns 404 — the path becomes part of the secret.
 */
const SUFFIX = (process.env.ADMIN_PATH_SUFFIX ?? "").trim();

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!SUFFIX) {
    // No obfuscation configured — leave /admin and its children alone.
    return NextResponse.next();
  }

  const expected = `/admin-${SUFFIX}`;

  // /admin-<suffix> (or nested) → rewrite internally to the canonical /admin*
  if (pathname === expected || pathname.startsWith(`${expected}/`)) {
    const rewritten = pathname.replace(expected, "/admin");
    const url = req.nextUrl.clone();
    url.pathname = rewritten;
    return NextResponse.rewrite(url);
  }

  // Block the bare /admin (and children) when the suffix is set.
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return new NextResponse("Not Found", { status: 404 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/admin-:suffix", "/admin-:suffix/:path*"],
};
