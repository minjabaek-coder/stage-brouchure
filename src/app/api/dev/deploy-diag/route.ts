import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * 임시 배포 진단 — Vercel + Neon + Vercel Blob 배포 직후 Prisma 가 어떤 에러를
 * 던지는지 빠르게 회수. 환경변수 마스킹된 요약 + 가벼운 prisma 호출 한 번 +
 * 잡힌 에러 전체 메시지/code/meta 를 반환. 운영 시작 전 (실명단 업로드 전)
 * 에 삭제 예정.
 */
export async function GET() {
  const env = {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL_set: Boolean(process.env.DATABASE_URL),
    DATABASE_URL_host: safeHost(process.env.DATABASE_URL),
    DIRECT_URL_set: Boolean(process.env.DIRECT_URL),
    DIRECT_URL_host: safeHost(process.env.DIRECT_URL),
    BLOB_TOKEN_set: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
    ADMIN_PATH_SUFFIX: process.env.ADMIN_PATH_SUFFIX ?? null,
  };

  let probe: unknown;
  try {
    const [attendees, assets, backups] = await Promise.all([
      prisma.attendee.count(),
      prisma.asset.count(),
      prisma.csvBackup.count(),
    ]);
    probe = { ok: true, counts: { attendees, assets, backups } };
  } catch (e) {
    probe = {
      ok: false,
      name: (e as Error)?.name,
      message: (e as Error)?.message,
      code: (e as { code?: string })?.code,
      meta: (e as { meta?: unknown })?.meta,
    };
  }

  return NextResponse.json({ env, probe });
}

function safeHost(url: string | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).host;
  } catch {
    return null;
  }
}
