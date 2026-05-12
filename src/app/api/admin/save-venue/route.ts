import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  name: z.string().trim().min(1).max(200),
  // 줄바꿈 허용. UI 에서 whitespace-pre-line 으로 렌더한다.
  address: z.string().trim().min(1).max(500),
  // 빈 문자열이 들어오면 venue_map_url 키를 제거 (기본값 fallback).
  mapUrl: z
    .string()
    .trim()
    .max(1000)
    .url({ message: "유효한 URL 이 아닙니다" })
    .or(z.literal("")),
});

/**
 * Admin: save venue info as 3 keys in assets table.
 * - venue_name
 * - venue_address
 * - venue_map_url
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

  // 홈 페이지 (force-dynamic) 가 다음 렌더에서 새 값 사용
  revalidatePath("/");
  revalidatePath("/admin");

  return NextResponse.json({ ok: true });
}
