import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { MAX_IMAGE_BYTES, optimizeImage } from "@/lib/image";
import { saveImageAsset } from "@/lib/storage";

export const runtime = "nodejs";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/jpg"]);

export async function POST(req: NextRequest) {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "INVALID_FORM" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "MISSING_FILE" }, { status: 400 });
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return NextResponse.json(
      {
        error: "FILE_TOO_LARGE",
        message: `4MB 를 초과합니다 (${(file.size / 1024 / 1024).toFixed(1)}MB)`,
      },
      { status: 413 },
    );
  }

  if (file.type && !ALLOWED.has(file.type)) {
    return NextResponse.json(
      { error: "UNSUPPORTED_TYPE", message: "JPG 또는 PNG 만 가능합니다." },
      { status: 415 },
    );
  }

  const input = Buffer.from(await file.arrayBuffer());
  let optimized: Buffer;
  try {
    optimized = await optimizeImage(input);
  } catch {
    return NextResponse.json(
      { error: "IMAGE_DECODE_FAILED", message: "이미지를 읽을 수 없습니다." },
      { status: 400 },
    );
  }

  const url = await saveImageAsset("seatmap.jpg", optimized);

  await prisma.asset.upsert({
    where: { key: "seat_map" },
    create: { key: "seat_map", url },
    update: { url },
  });

  revalidatePath("/search");
  revalidatePath("/admin");

  return NextResponse.json({ url, sizeBytes: optimized.length });
}
