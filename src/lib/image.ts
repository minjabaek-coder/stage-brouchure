import sharp from "sharp";

export { MAX_IMAGE_BYTES } from "@/lib/limits";

/**
 * Optimize uploaded images to a uniform size & format (PRD §2.3.4):
 * 1600px wide max (no enlargement), JPEG quality 80, mozjpeg.
 * Output is always JPEG so the public-facing filename can be `.jpg`.
 */
export async function optimizeImage(input: Buffer): Promise<Buffer> {
  return sharp(input)
    .rotate() // honor EXIF orientation before resizing
    .resize({ width: 1600, withoutEnlargement: true })
    .jpeg({ quality: 80, mozjpeg: true })
    .toBuffer();
}
