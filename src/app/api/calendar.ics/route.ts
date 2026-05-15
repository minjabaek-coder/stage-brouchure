import { NextResponse } from "next/server";
import { buildIcs } from "@/lib/calendar";

// Static event details; DTSTAMP is generated per-request, so the response
// isn't cacheable. Edge runtime is fine — no Prisma/Node-specific deps.
export const runtime = "edge";

export function GET(): NextResponse {
  const body = buildIcs();
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition":
        'attachment; filename="eoullim-concert-2026-05-26.ics"',
      "Cache-Control": "no-store",
    },
  });
}
