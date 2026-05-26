import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { deletePhoto } from "@/lib/photos";
import { deleteUserPhoto } from "@/lib/storage";
import { Prisma } from "@prisma/client";

export const runtime = "nodejs";

/**
 * DELETE /api/admin/photos/[id] — 운영자 사진 삭제.
 * DB row 제거 후 Vercel Blob 객체도 best-effort로 제거.
 */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json(
      { error: { code: "MISSING_ID" } },
      { status: 400 },
    );
  }

  let url: string;
  try {
    const result = await deletePhoto(id);
    url = result.url;
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025"
    ) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND" } },
        { status: 404 },
      );
    }
    throw err;
  }

  // Blob 삭제 실패는 운영을 막지 않는다 (DB는 이미 제거됨).
  try {
    await deleteUserPhoto(url);
  } catch (e) {
    console.error("[admin/photos] Blob delete failed:", e);
  }

  revalidatePath("/messages");

  return NextResponse.json({ data: { id } });
}
