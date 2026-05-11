import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { ratelimit } from "@/lib/ratelimit";

const SearchInput = z.object({
  name: z
    .string()
    .transform((s) => s.trim())
    .pipe(z.string().min(1)),
  phone_last4: z.string().regex(/^\d{4}$/),
});

function getClientIp(req: NextRequest): string {
  // Vercel/Cloudflare both populate x-forwarded-for; take the first hop.
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "anon";
}

/**
 * FR-G03 (search) + FR-G05 (rate limit). Response shape (PRD §2.2.5):
 *   200  { data: { name, seat, note, phoneLast4 } }
 *   400  { error: { code: "INVALID_INPUT" } }
 *   404  { error: { code: "NOT_FOUND" } }   ← 이름·전화 어느 쪽이 틀려도 동일 메시지
 *   429  { error: { code: "RATE_LIMITED" } }
 */
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { success } = await ratelimit.limit(ip);
  if (!success) {
    return NextResponse.json(
      { error: { code: "RATE_LIMITED" } },
      { status: 429 },
    );
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

  const parsed = SearchInput.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "INVALID_INPUT" } },
      { status: 400 },
    );
  }

  const found = await prisma.attendee.findFirst({
    where: {
      name: parsed.data.name,
      phoneLast4: parsed.data.phone_last4,
    },
    select: { name: true, seat: true, note: true, phoneLast4: true },
  });

  if (!found) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND" } },
      { status: 404 },
    );
  }

  return NextResponse.json({ data: found });
}
