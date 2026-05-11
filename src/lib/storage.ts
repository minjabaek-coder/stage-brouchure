import { promises as fs } from "node:fs";
import path from "node:path";

const LOCAL_BACKUP_DIR =
  process.env.LOCAL_BACKUP_DIR ?? path.join(process.cwd(), ".backups");

const PUBLIC_UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

/**
 * Write a CSV backup. For now this only implements the local-fs adapter so
 * dev/test work without Supabase Storage. Production-ready Storage upload
 * lives in S12 (Supabase signed URLs); when SUPABASE_URL is set in S12+ we
 * will swap the body for a Storage `upload()` call.
 *
 * Returns the path stored in csv_backups.storage_path.
 */
export async function saveBackupCsv(filename: string, content: string): Promise<string> {
  await fs.mkdir(LOCAL_BACKUP_DIR, { recursive: true });
  const fullPath = path.join(LOCAL_BACKUP_DIR, filename);
  await fs.writeFile(fullPath, content, "utf8");
  // Record a path that's stable across machines — relative to project root.
  return path.relative(process.cwd(), fullPath);
}

/**
 * Save an uploaded image to /public/uploads so Next can serve it directly
 * (no Storage round-trip needed for dev). Returns a versioned URL with a
 * cache-buster (`?v=ts`) so /search picks up the new image without a hard
 * refresh. Production should swap this for a Supabase Storage upload.
 */
export async function saveImageAsset(
  filename: string,
  content: Buffer,
): Promise<string> {
  await fs.mkdir(PUBLIC_UPLOAD_DIR, { recursive: true });
  const fullPath = path.join(PUBLIC_UPLOAD_DIR, filename);
  await fs.writeFile(fullPath, content);
  return `/uploads/${filename}?v=${Date.now()}`;
}

/**
 * Best-effort delete (used when pruning the oldest backup once the policy of
 * "keep 3" kicks in on the 4th upload). Missing file is not an error — the
 * Storage row may exist after a manual cleanup.
 */
export async function deleteBackupCsv(storagePath: string): Promise<void> {
  const full = path.isAbsolute(storagePath)
    ? storagePath
    : path.join(process.cwd(), storagePath);
  try {
    await fs.unlink(full);
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
  }
}
