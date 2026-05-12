/**
 * Build-time QR generator. Writes public/share-qr.svg pointing at the
 * site's public URL (NEXT_PUBLIC_SITE_URL or fallback). Runs via the
 * `prebuild` npm hook so deploys always ship an in-sync code.
 *
 * Run manually: pnpm tsx scripts/generate-qr.ts
 *
 * `qrcode` is a devDependency only — the runtime bundle stays unchanged.
 */
import { writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import QRCode from "qrcode";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";

const OUT_PATH = resolve(process.cwd(), "public/share-qr.svg");

async function main(): Promise<void> {
  const svg = await QRCode.toString(SITE_URL, {
    type: "svg",
    errorCorrectionLevel: "M",
    margin: 1,
    color: { dark: "#1A1410", light: "#FBF6EB" },
  });

  await mkdir(dirname(OUT_PATH), { recursive: true });
  await writeFile(OUT_PATH, svg, "utf8");

  console.log(`[generate-qr] ${SITE_URL} → ${OUT_PATH}`);
}

main().catch((err) => {
  console.error("[generate-qr] failed:", err);
  process.exit(1);
});
