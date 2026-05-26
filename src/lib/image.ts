import sharp from "sharp";

export { MAX_IMAGE_BYTES } from "@/lib/limits";

/**
 * Optimize operator uploads (seat map, brochure) — PRD §2.3.4 / §3.5.2.
 * 1600px wide max, JPEG quality 80, mozjpeg. Output is always JPEG so the
 * public-facing filename can be `.jpg`.
 */
export async function optimizeImage(input: Buffer): Promise<Buffer> {
  return sharp(input)
    .rotate() // honor EXIF orientation before resizing
    .resize({ width: 1600, withoutEnlargement: true })
    .jpeg({ quality: 80, mozjpeg: true })
    .toBuffer();
}

export interface OptimizedPhoto {
  buffer: Buffer;
  width: number;
  height: number;
  byteSize: number;
}

/**
 * 2-stage compression pipeline — server side (PRD §4.5).
 * Client already shrunk to ≤800KB · 1600px · JPEG 80. This pass:
 *   1. Honor EXIF orientation, then re-encode without metadata → strips
 *      EXIF (incl. GPS) for privacy.
 *   2. Resize to max 1200px wide/tall, JPEG quality 75 — typical output
 *      300–500KB so a 1GB Vercel Blob bucket holds ~2,500 photos.
 *
 * Returns the post-rotation dimensions so the `photos` row can record them
 * for next/image sizing and storage telemetry.
 */
export async function optimizeUserPhoto(
  input: Buffer,
): Promise<OptimizedPhoto> {
  // Compute dimensions AFTER rotate() so portrait/landscape is correct.
  const rotated = await sharp(input).rotate().toBuffer();
  const meta = await sharp(rotated).metadata();
  const buffer = await sharp(rotated)
    .resize({ width: 1200, height: 1200, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 75, mozjpeg: true })
    .toBuffer();

  // After resize, dimensions may shrink. Re-read final meta for accuracy.
  const finalMeta = await sharp(buffer).metadata();
  return {
    buffer,
    width: finalMeta.width ?? meta.width ?? 0,
    height: finalMeta.height ?? meta.height ?? 0,
    byteSize: buffer.byteLength,
  };
}
