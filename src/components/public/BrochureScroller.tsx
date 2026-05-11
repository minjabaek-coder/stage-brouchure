import { type FC } from "react";
import { prisma } from "@/lib/db";
import BrochureGallery from "@/components/public/BrochureGallery";

const BROCHURE_KEYS = Array.from(
  { length: 8 },
  (_, i) => `brochure_${String(i + 1).padStart(2, "0")}`,
);

/**
 * Server component for /brochure. Resolves the 8 brochure assets in their
 * canonical order (brochure_01..08) and either mounts the BrochureGallery
 * client component or renders a "준비 중" placeholder when one or more pages
 * have not been uploaded yet (PRD §3.5.2 / FR-G06).
 */
const BrochureScroller: FC = async () => {
  const rows = await prisma.asset.findMany({
    where: { key: { in: BROCHURE_KEYS } },
  });
  const byKey = new Map(rows.map((r) => [r.key, r.url]));
  const urls = BROCHURE_KEYS.map((k) => byKey.get(k) ?? null);
  const allPresent = urls.every((u): u is string => Boolean(u));

  if (!allPresent) {
    return (
      <div
        className="font-serif-ko text-paper/55 mt-8 rounded-[2px] border border-dashed border-[rgba(197,165,114,0.3)] px-5 py-10 text-center text-sm leading-[1.7]"
        data-testid="brochure-placeholder"
      >
        <p className="font-serif-en text-gold mb-2 text-[13px] tracking-[0.2em] italic">
          — Coming soon —
        </p>
        브로셔가 곧 업로드됩니다.
      </div>
    );
  }

  return <BrochureGallery urls={urls as string[]} />;
};

export default BrochureScroller;
