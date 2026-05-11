import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * Internal helper used by the S05 e2e (`s05-db-seed.spec.ts`) to verify that
 * the test database has been seeded. **Disabled outside of dev/test** so it
 * never ships to production.
 */
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse("Not Found", { status: 404 });
  }

  const [attendees, videoAsset] = await Promise.all([
    prisma.attendee.count(),
    prisma.asset.findUnique({ where: { key: "video_youtube_id" } }),
  ]);

  return NextResponse.json({
    attendees,
    videoId: videoAsset?.url ?? null,
  });
}
