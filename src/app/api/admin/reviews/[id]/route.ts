import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { deleteReview } from "@/lib/reviews";
import { Prisma } from "@prisma/client";

export const runtime = "nodejs";

/**
 * DELETE /api/admin/reviews/[id] — 운영자 후기 삭제.
 * 보안: PRD §3.1 — 인증 없음, /admin 경로 obfuscation 패턴.
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

  try {
    await deleteReview(id);
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

  revalidatePath("/messages");

  return NextResponse.json({ data: { id } });
}
