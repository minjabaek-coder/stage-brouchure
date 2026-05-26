import { NextResponse, type NextRequest } from "next/server";
import { PhotoMetaInput, createPhoto, getAllPhotos } from "@/lib/photos";
import { photosRatelimit } from "@/lib/ratelimit";
import { optimizeUserPhoto } from "@/lib/image";
import { saveUserPhoto } from "@/lib/storage";
import { MAX_IMAGE_BYTES } from "@/lib/limits";

export const runtime = "nodejs";

const ALLOWED = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/heic",
  "image/heif",
  "image/webp",
]);

const MAX_PHOTOS_PER_REQUEST = 3;

function getClientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "anon";
}

/** GET /api/photos — 최신순 갤러리 list. */
export async function GET() {
  const data = await getAllPhotos();
  return NextResponse.json({ data });
}

/**
 * POST /api/photos — 관객 사진 업로드 (multipart).
 *
 * Body (multipart/form-data):
 *   nickname: string         (2–10자, 필수)
 *   caption:  string         (0–100자, optional)
 *   files:    File[]         (1–3장, 이미 client 압축됨)
 *
 * Responses:
 *   200  { data: PublicPhoto[] }
 *   400  { error: { code: "INVALID_INPUT" | "MISMATCHED_INPUT", message? } }
 *   413  { error: { code: "FILE_TOO_LARGE", message } }
 *   415  { error: { code: "UNSUPPORTED_TYPE", message } }
 *   429  { error: { code: "RATE_LIMITED" } }
 *   500  { error: { code: "IMAGE_DECODE_FAILED" } }
 */
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);

  const bypass =
    process.env.NODE_ENV !== "production" &&
    req.headers.get("x-ratelimit-bypass") === "test";

  if (!bypass) {
    const { success } = await photosRatelimit.limit(ip);
    if (!success) {
      return NextResponse.json(
        { error: { code: "RATE_LIMITED" } },
        { status: 429 },
      );
    }
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json(
      { error: { code: "INVALID_INPUT" } },
      { status: 400 },
    );
  }

  const parsedMeta = PhotoMetaInput.safeParse({
    nickname: formData.get("nickname"),
    caption: formData.get("caption") ?? "",
  });
  if (!parsedMeta.success) {
    return NextResponse.json(
      {
        error: {
          code: "INVALID_INPUT",
          message: parsedMeta.error.issues[0]?.message,
        },
      },
      { status: 400 },
    );
  }

  const files = formData
    .getAll("files")
    .filter((v): v is File => v instanceof File);

  if (files.length === 0 || files.length > MAX_PHOTOS_PER_REQUEST) {
    return NextResponse.json(
      {
        error: {
          code: "MISMATCHED_INPUT",
          message: "사진은 1–3장 사이로 올려 주세요.",
        },
      },
      { status: 400 },
    );
  }

  for (const f of files) {
    if (f.size > MAX_IMAGE_BYTES) {
      return NextResponse.json(
        {
          error: {
            code: "FILE_TOO_LARGE",
            message: `사진이 너무 큽니다 (${(f.size / 1024 / 1024).toFixed(1)}MB). 다시 시도해 주세요.`,
          },
        },
        { status: 413 },
      );
    }
    if (f.type && !ALLOWED.has(f.type)) {
      return NextResponse.json(
        {
          error: {
            code: "UNSUPPORTED_TYPE",
            message: "JPG/PNG/HEIC 만 업로드할 수 있어요.",
          },
        },
        { status: 415 },
      );
    }
  }

  const created = [];
  for (const file of files) {
    const input = Buffer.from(await file.arrayBuffer());
    let optimized;
    try {
      optimized = await optimizeUserPhoto(input);
    } catch {
      return NextResponse.json(
        {
          error: {
            code: "IMAGE_DECODE_FAILED",
            message: "사진을 읽을 수 없습니다.",
          },
        },
        { status: 500 },
      );
    }

    const url = await saveUserPhoto(optimized.buffer);
    const row = await createPhoto({
      nickname: parsedMeta.data.nickname,
      caption: parsedMeta.data.caption,
      url,
      width: optimized.width,
      height: optimized.height,
      byteSize: optimized.byteSize,
    });
    created.push(row);
  }

  return NextResponse.json({ data: created });
}
