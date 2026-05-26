import { NextResponse, type NextRequest } from "next/server";
import { ReviewInput, createReview, getAllReviews } from "@/lib/reviews";
import { reviewsRatelimit } from "@/lib/ratelimit";

export const runtime = "nodejs";

function getClientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "anon";
}

/** GET /api/reviews — 최신순 후기 list. */
export async function GET() {
  const data = await getAllReviews();
  return NextResponse.json({ data });
}

/**
 * POST /api/reviews — 관람 후기 작성.
 *  200  { data: PublicReview }
 *  400  { error: { code: "INVALID_INPUT", message? } }
 *  429  { error: { code: "RATE_LIMITED" } }
 */
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);

  // Dev/test escape hatch — same pattern as /api/messages.
  const bypass =
    process.env.NODE_ENV !== "production" &&
    req.headers.get("x-ratelimit-bypass") === "test";

  if (!bypass) {
    const { success } = await reviewsRatelimit.limit(ip);
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

  const parsed = ReviewInput.safeParse(body);
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

  const created = await createReview(parsed.data);
  return NextResponse.json({ data: created });
}
