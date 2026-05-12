import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { scrapeOgImage } from "@/lib/og";
import { optimizeImage } from "@/lib/image";
import { saveImageAsset } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  name: z.string().trim().min(1).max(200),
  address: z.string().trim().min(1).max(500),
  mapUrl: z
    .string()
    .trim()
    .max(1000)
    .url({ message: "유효한 URL 이 아닙니다" })
    .or(z.literal("")),
});

/**
 * Admin: save venue info into the assets table.
 *   - venue_name
 *   - venue_address
 *   - venue_map_url
 *   - venue_map_image  (NEW — auto-fetched OG image of map URL when available)
 *
 * The OG fetch is best-effort: if it fails (timeout, no og:image, wrong CT)
 * the rest of the save still succeeds and the existing preview is left as is
 * so the operator can manually upload a screenshot in a follow-up workflow.
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

  const { name, address, mapUrl } = parsed.data;

  // 1) Save text fields first so the rest of the response is fast even if
  //    the OG fetch takes a few seconds.
  await prisma.$transaction(async (tx) => {
    await tx.asset.upsert({
      where: { key: "venue_name" },
      create: { key: "venue_name", url: name },
      update: { url: name },
    });
    await tx.asset.upsert({
      where: { key: "venue_address" },
      create: { key: "venue_address", url: address },
      update: { url: address },
    });
    if (mapUrl) {
      await tx.asset.upsert({
        where: { key: "venue_map_url" },
        create: { key: "venue_map_url", url: mapUrl },
        update: { url: mapUrl },
      });
    } else {
      await tx.asset.deleteMany({ where: { key: "venue_map_url" } });
    }
  });

  // 2) Best-effort OG scrape. Cached image always reflects the *current* URL
  //    so changing URL or removing it invalidates the previous preview.
  let mapImage: { url: string; source: string } | null = null;
  let mapImageError: string | null = null;
  if (mapUrl) {
    try {
      const og = await scrapeOgImage(mapUrl);
      if (og) {
        const optimized = await optimizeImage(og.imageBuffer);
        const stored = await saveImageAsset("venue-map-preview.jpg", optimized);
        await prisma.asset.upsert({
          where: { key: "venue_map_image" },
          create: { key: "venue_map_image", url: stored },
          update: { url: stored },
        });
        mapImage = { url: stored, source: og.imageUrl };
      } else {
        // 새 URL 에서 OG 를 못 찾으면 이전 캐시도 무효화 — 그래야 미리보기가
        // 항상 현재 URL 과 일치한다. fallback 은 SVG mockup.
        await prisma.asset.deleteMany({ where: { key: "venue_map_image" } });
        mapImageError = "이 URL 에서 og:image / twitter:image 메타 태그를 찾지 못했습니다. SVG 미리보기로 표시됩니다.";
      }
    } catch (e) {
      await prisma.asset.deleteMany({ where: { key: "venue_map_image" } });
      mapImageError =
        e instanceof Error ? `OG 이미지 자동 추출 실패: ${e.message}` : "OG 이미지 자동 추출 실패";
    }
  } else {
    // URL 자체를 비우면 캐시도 같이 비움
    await prisma.asset.deleteMany({ where: { key: "venue_map_image" } });
  }

  revalidatePath("/");
  revalidatePath("/admin");

  return NextResponse.json({ ok: true, mapImage, mapImageError });
}
