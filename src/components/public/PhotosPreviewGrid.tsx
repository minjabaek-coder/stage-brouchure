import Image from "next/image";
import Link from "next/link";
import { type FC } from "react";
import type { PublicPhoto } from "@/lib/photos";

interface PhotosPreviewGridProps {
  items: PublicPhoto[];
}

/**
 * Home-page photo teaser — up to 6 thumbnails in a 3-col grid. Every tile
 * links to `/messages?tab=photos` rather than opening a lightbox, so the
 * home page stays light (no `yet-another-react-lightbox` JS on initial
 * load). The full lightbox experience lives on the gallery page itself.
 */
const PhotosPreviewGrid: FC<PhotosPreviewGridProps> = ({ items }) => {
  if (items.length === 0) {
    return (
      <p
        className="text-muted py-6 text-center text-[13px] leading-[1.6]"
        data-testid="photos-preview-empty"
      >
        첫 사진을 올려 주세요.
      </p>
    );
  }
  return (
    <ul
      className="grid grid-cols-3 gap-1.5"
      data-testid="photos-preview-grid"
      aria-label="최근 공유 사진 미리보기"
    >
      {items.map((p) => (
        <li key={p.id} className="aspect-square">
          <Link
            href="/messages?tab=photos"
            className="border-line hover:border-gold focus-visible:ring-gold/40 group relative block h-full w-full overflow-hidden rounded-lg border bg-white transition-colors focus-visible:ring-2 focus-visible:outline-none"
            style={{ borderWidth: "0.5px" }}
            aria-label={`${p.nickname} 님의 사진 — 전체 갤러리로 이동`}
            data-testid={`photo-preview-trigger-${p.id}`}
          >
            <Image
              src={p.url}
              alt={p.caption ? p.caption : `${p.nickname} 님의 사진`}
              fill
              sizes="(max-width: 480px) 33vw, 140px"
              className="object-cover transition-transform group-hover:scale-[1.02]"
              data-testid={`photo-preview-img-${p.id}`}
            />
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default PhotosPreviewGrid;
