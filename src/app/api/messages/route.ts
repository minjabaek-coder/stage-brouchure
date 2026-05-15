import { NextResponse, type NextRequest } from "next/server";
import {
  MessageInput,
  createMessage,
  getRecentMessages,
} from "@/lib/messages";
import { messagesRatelimit } from "@/lib/ratelimit";

export const runtime = "nodejs";

function getClientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "anon";
}

/** GET /api/messages?limit=20 — 최신순 list. */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const raw = url.searchParams.get("limit");
  const take = raw ? Math.max(1, Math.min(parseInt(raw, 10) || 20, 100)) : 20;
  const data = await getRecentMessages(take);
  return NextResponse.json({ data });
}

/**
 * POST /api/messages — 방명록 작성.
 *  200  { data: PublicMessage }
 *  400  { error: { code: "INVALID_INPUT", message? } }
 *  429  { error: { code: "RATE_LIMITED" } }
 */
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);

  // Dev/test only escape hatch — lets E2E specs that exercise unrelated paths
  // skip the 1/min cap while the rate-limit test itself omits the header.
  // Header check is gated by NODE_ENV so production traffic can't bypass.
  const bypass =
    process.env.NODE_ENV !== "production" &&
    req.headers.get("x-ratelimit-bypass") === "test";

  if (!bypass) {
    const { success } = await messagesRatelimit.limit(ip);
    if (!success) {
      return NextResponse.json(
        { error: { code: "RATE_LIMITED" } },
        { status: 429 },
      );
    }
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: { code: "INVALID_INPUT" } },
      { status: 400 },
    );
  }

  const parsed = MessageInput.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: "INVALID_INPUT",
          message: parsed.error.issues[0]?.message,
        },
      },
      { status: 400 },
    );
  }

  const created = await createMessage(parsed.data);
  return NextResponse.json({ data: created });
}
