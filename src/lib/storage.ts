import { promises as fs } from "node:fs";
import path from "node:path";
import { del, put } from "@vercel/blob";

/**
 * Storage adapter — Vercel Blob 이 우선, 환경변수가 없으면 로컬 파일시스템.
 *
 * 단일 Blob store 안에서 폴더로 분리 (docs/09-deployment.md §3 참조):
 *   - images/<file>    (public read)  : seatmap.jpg, brochure-NN.jpg
 *   - backups/<file>   (public read*) : CSV 자동 백업
 *
 * *Vercel Blob 은 현재 store 단위로 access mode 가 설정되며 Hobby 에서는
 *  public 만 지원한다. 백업 CSV 의 보안은 (1) URL 추측 불가능한 random
 *  suffix + (2) `ADMIN_PATH_SUFFIX` 로 가려진 admin UI 에서만 다운로드
 *  링크를 노출 — 두 가지 layer 로 처리한다.
 *
 * Vercel 서버리스 파일시스템은 ephemeral 이라 dev/test 외에는 로컬 fs 를
 * 못 쓴다. BLOB_READ_WRITE_TOKEN 이 설정되면 자동 전환.
 */

const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

const LOCAL_BACKUP_DIR =
  process.env.LOCAL_BACKUP_DIR ?? path.join(process.cwd(), ".backups");
const PUBLIC_UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

function isBlobEnabled(): boolean {
  return Boolean(BLOB_TOKEN);
}

/**
 * CSV 백업 저장. Blob 사용 시 객체 URL 을 반환, 로컬 fs 사용 시 프로젝트
 * 루트 기준 상대 경로 반환. 호출부는 그 값을 그대로 csv_backups.storagePath
 * 에 저장한다. (Blob 은 삭제 시 같은 URL 이 필요하므로 URL 전체를 저장.)
 */
export async function saveBackupCsv(
  filename: string,
  content: string,
): Promise<string> {
  if (isBlobEnabled()) {
    const result = await put(`backups/${filename}`, content, {
      access: "public",
      contentType: "text/csv; charset=utf-8",
      // 같은 filename 재업로드 시 새 random suffix 가 붙도록 둔다 (default).
      // 과거 백업 삭제는 deleteBackupCsv(URL) 로 명시적으로 한다.
      token: BLOB_TOKEN,
    });
    return result.url;
  }

  await fs.mkdir(LOCAL_BACKUP_DIR, { recursive: true });
  const fullPath = path.join(LOCAL_BACKUP_DIR, filename);
  await fs.writeFile(fullPath, content, "utf8");
  return path.relative(process.cwd(), fullPath);
}

/**
 * 좌석맵/브로셔 이미지를 업로드하고 next/image 가 쓸 수 있는 URL 을 반환.
 * 항상 `?v=<ts>` cache buster 를 붙여서 운영자가 같은 파일명을 재업로드해도
 * /search, /brochure 가 새 이미지를 즉시 인식한다.
 */
export async function saveImageAsset(
  filename: string,
  content: Buffer,
): Promise<string> {
  if (isBlobEnabled()) {
    const result = await put(`images/${filename}`, content, {
      access: "public",
      contentType: "image/jpeg",
      // 같은 filename 으로 덮어쓰기. 운영자가 seatmap.jpg 를 재업로드하면
      // 기존 객체를 그대로 교체하고 같은 URL 유지.
      allowOverwrite: true,
      addRandomSuffix: false,
      token: BLOB_TOKEN,
    });
    return `${result.url}?v=${Date.now()}`;
  }

  await fs.mkdir(PUBLIC_UPLOAD_DIR, { recursive: true });
  const fullPath = path.join(PUBLIC_UPLOAD_DIR, filename);
  await fs.writeFile(fullPath, content);
  return `/uploads/${filename}?v=${Date.now()}`;
}

/**
 * Best-effort delete (S11 의 "백업 3개 보존" 정책에서 가장 오래된 백업 prune).
 * 존재하지 않는 파일은 에러 아님.
 *
 * storagePath: Blob 모드에서는 saveBackupCsv 가 반환한 URL 전체.
 * fs 모드에서는 path.relative 결과.
 */
export async function deleteBackupCsv(storagePath: string): Promise<void> {
  if (isBlobEnabled()) {
    try {
      await del(storagePath, { token: BLOB_TOKEN });
    } catch (e) {
      // 이미 삭제된 경우는 무시
      const msg = e instanceof Error ? e.message : String(e);
      if (!/not\s*found|404/i.test(msg)) throw e;
    }
    return;
  }

  const full = path.isAbsolute(storagePath)
    ? storagePath
    : path.join(process.cwd(), storagePath);
  try {
    await fs.unlink(full);
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
  }
}
