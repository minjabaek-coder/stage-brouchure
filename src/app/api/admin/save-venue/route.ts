import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  name: z.string().trim().min(1).max(200),
  line: z.string().trim().max(40).default("9호선"),
  prevStation: z.string().trim().max(40).default(""),
  destStation: z.string().trim().min(1).max(40),
  exit: z.string().trim().min(1).max(40),
  walkDistance: z.string().trim().min(1).max(40),
  address: z.string().trim().min(1).max(500),
  mapUrl: z
    .string()
    .trim()
    .max(1000)
    .url({ message: "유효한 URL 이 아닙니다" })
    .or(z.literal("")),
});

/**
 * Admin: save venue info into the assets table. The public VenueCard reads
 * the same keys and renders a parametric SVG illustration — no separate
 * image upload required.
 *
 * Keys used:
 *   venue_name, venue_line, venue_prev_station, venue_dest_station,
 *   venue_exit, venue_walk_distance, venue_address, venue_map_url
 */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: { code: "INVALID_INPUT" } },
      { status: 400 },
    );
  }

  const parsed = Body.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: "INVALID_INPUT",
          message: parsed.error.issues[0]?.message ?? "잘못된 입력",
        },
      },
      { status: 400 },
    );
  }

  const v = parsed.data;

  // Pairs of (key, value). Empty-string values delete the key so the resolver
  // falls back to EVENT defaults instead of rendering blanks.
  const writes: Array<[string, string]> = [
    ["venue_name", v.name],
    ["venue_line", v.line],
    ["venue_prev_station", v.prevStation],
    ["venue_dest_station", v.destStation],
    ["venue_exit", v.exit],
    ["venue_walk_distance", v.walkDistance],
    ["venue_address", v.address],
    ["venue_map_url", v.mapUrl],
  ];

  await prisma.$transaction(async (tx) => {
    for (const [key, value] of writes) {
      if (value === "") {
        await tx.asset.deleteMany({ where: { key } });
      } else {
        await tx.asset.upsert({
          where: { key },
          create: { key, url: value },
          update: { url: value },
        });
      }
    }
  });

  revalidatePath("/");
  revalidatePath("/admin");

  return NextResponse.json({ ok: true });
}
