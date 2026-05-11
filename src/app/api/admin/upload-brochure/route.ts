import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { MAX_IMAGE_BYTES } from "@/lib/limits";
import { optimizeImage } from "@/lib/image";
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

  const files = formData.getAll("files").filter((v): v is File => v instanceof File);
  const slots = formData
    .getAll("slots")
    .map((v) => Number(v))
    .filter((n) => Number.isInteger(n) && n >= 1 && n <= 8);

  if (files.length === 0 || files.length !== slots.length) {
    return NextResponse.json(
      { error: "MISMATCHED_INPUT", message: "files 와 slots 개수가 일치하지 않습니다." },
      { status: 400 },
    );
  }
  if (files.length > 8) {
    return NextResponse.json(
      { error: "TOO_MANY_FILES", message: "한 번에 최대 8장까지 업로드할 수 있습니다." },
      { status: 400 },
    );
  }

  // Per-file validation (size + MIME) before any work happens.
  for (const f of files) {
    if (f.size > MAX_IMAGE_BYTES) {
      return NextResponse.json(
        {
          error: "FILE_TOO_LARGE",
          message: `${f.name}: 5MB 를 초과합니다 (${(f.size / 1024 / 1024).toFixed(1)}MB)`,
        },
        { status: 413 },
      );
    }
    if (f.type && !ALLOWED.has(f.type)) {
      return NextResponse.json(
        { error: "UNSUPPORTED_TYPE", message: `${f.name}: JPG 또는 PNG 만 가능합니다.` },
        { status: 415 },
      );
    }
  }

  const updated: { slot: number; url: string }[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i]!;
    const slot = slots[i]!;
    const padded = String(slot).padStart(2, "0");

    const input = Buffer.from(await file.arrayBuffer());
    let optimized: Buffer;
    try {
      optimized = await optimizeImage(input);
    } catch {
      return NextResponse.json(
        {
          error: "IMAGE_DECODE_FAILED",
          message: `${file.name}: 이미지를 읽을 수 없습니다.`,
        },
        { status: 400 },
      );
    }

    const url = await saveImageAsset(`brochure-${padded}.jpg`, optimized);
    await prisma.asset.upsert({
      where: { key: `brochure_${padded}` },
      create: { key: `brochure_${padded}`, url },
      update: { url },
    });

    updated.push({ slot, url });
  }

  revalidatePath("/brochure");
  revalidatePath("/admin");

  return NextResponse.json({ updated });
}
