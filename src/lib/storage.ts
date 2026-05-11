import { promises as fs } from "node:fs";
import path from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Storage adapter — Supabase Storage 가 우선, 환경변수가 없으면 로컬 파일시스템.
 *
 * Buckets (수동 생성 필요, docs/09-deployment.md §3 참조):
 *   - images   (public read)  : seatmap.jpg, brochure-NN.jpg
 *   - backups  (private)      : CSV 자동 백업
 *
 * Vercel 서버리스 파일시스템은 ephemeral 이라 dev/test 외에는 로컬 fs 를
 * 못 쓴다. SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY 가 설정되면 자동 전환.
 */

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const IMAGES_BUCKET = process.env.SUPABASE_IMAGES_BUCKET ?? "images";
const BACKUPS_BUCKET = process.env.SUPABASE_BACKUPS_BUCKET ?? "backups";

const LOCAL_BACKUP_DIR =
  process.env.LOCAL_BACKUP_DIR ?? path.join(process.cwd(), ".backups");
const PUBLIC_UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

function isSupabaseEnabled(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
}

let cachedClient: SupabaseClient | null = null;
function client(): SupabaseClient {
  if (cachedClient) return cachedClient;
  // isSupabaseEnabled() 가 true 일 때만 호출되므로 non-null 단언 안전
  cachedClient = createClient(SUPABASE_URL as string, SUPABASE_SERVICE_ROLE_KEY as string, {
    auth: { persistSession: false },
  });
  return cachedClient;
}

/**
 * CSV 백업 저장. Storage 사용 시 객체 path 반환 (`<filename>`), 로컬 fs 사용
 * 시 프로젝트 루트 기준 상대 경로 반환. 호출부는 그 값을 그대로 csv_backups
 * .storagePath 에 저장한다.
 */
export async function saveBackupCsv(
  filename: string,
  content: string,
): Promise<string> {
  if (isSupabaseEnabled()) {
    const { error } = await client()
      .storage.from(BACKUPS_BUCKET)
      .upload(filename, content, {
        contentType: "text/csv; charset=utf-8",
        upsert: true,
      });
    if (error) throw new Error(`Supabase backup upload failed: ${error.message}`);
    return filename;
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
  if (isSupabaseEnabled()) {
    const sb = client();
    const { error } = await sb.storage
      .from(IMAGES_BUCKET)
      .upload(filename, content, {
        contentType: "image/jpeg",
        upsert: true,
      });
    if (error) throw new Error(`Supabase image upload failed: ${error.message}`);
    const { data } = sb.storage.from(IMAGES_BUCKET).getPublicUrl(filename);
    return `${data.publicUrl}?v=${Date.now()}`;
  }

  await fs.mkdir(PUBLIC_UPLOAD_DIR, { recursive: true });
  const fullPath = path.join(PUBLIC_UPLOAD_DIR, filename);
  await fs.writeFile(fullPath, content);
  return `/uploads/${filename}?v=${Date.now()}`;
}

/**
 * Best-effort delete (S11 의 "백업 3개 보존" 정책에서 가장 오래된 백업 prune).
 * 존재하지 않는 파일은 에러 아님.
 */
export async function deleteBackupCsv(storagePath: string): Promise<void> {
  if (isSupabaseEnabled()) {
    // Storage 에 저장할 때 filename 만 넣으므로 storagePath 도 filename.
    // 과거 로컬 fs 시절에 저장된 `path.relative()` 형식이 들어올 수도 있어
    // basename 으로 정규화한다.
    const key = path.basename(storagePath);
    const { error } = await client().storage.from(BACKUPS_BUCKET).remove([key]);
    if (error) {
      // 404 인 경우는 무시
      if (!/not\s*found/i.test(error.message)) throw error;
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
