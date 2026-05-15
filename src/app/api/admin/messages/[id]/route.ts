import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { deleteMessage } from "@/lib/messages";
import { Prisma } from "@prisma/client";

export const runtime = "nodejs";

/**
 * DELETE /api/admin/messages/[id] — 운영자 삭제.
 * 보안: PRD §3.1 — 인증 없음, /admin 경로 obfuscation (ADMIN_PATH_SUFFIX) 으로
 * UI 진입을 제한하는 패턴을 따른다. 기존 /api/admin/* 와 동일 정책.
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
    await deleteMessage(id);
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

  // 홈 미리보기와 /messages 양쪽 모두 갱신
  revalidatePath("/");
  revalidatePath("/messages");

  return NextResponse.json({ data: { id } });
}
