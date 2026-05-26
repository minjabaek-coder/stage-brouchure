"use client";

import Image from "next/image";
import { type FC, useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import type { PublicPhoto } from "@/lib/photos";

interface PhotosGalleryProps {
  items: PublicPhoto[];
}

/**
 * 3-column responsive grid of audience photos. Tap any thumbnail to open a
 * full-screen lightbox carousel (reuses yet-another-react-lightbox already
 * used by /brochure and /search seatmap, so no new lightbox dep).
 *
 * Compression upstream ensures every URL points at a JPEG ≤ ~500KB sized
 * ≤1200px, so we can request the full image and let next/image generate
 * srcset for thumbnails.
 */
const PhotosGallery: FC<PhotosGalleryProps> = ({ items }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (items.length === 0) {
    return (
      <p
        className="text-muted py-12 text-center text-[14px] leading-[1.6]"
        data-testid="photos-gallery-empty"
      >
        아직 공유된 사진이 없어요.
        <br />첫 사진을 올려 주세요.
      </p>
    );
  }

  return (
    <>
      <ul
        className="grid grid-cols-3 gap-1.5"
        data-testid="photos-gallery"
        aria-label="관객 공유 사진"
      >
        {items.map((p, idx) => (
          <li key={p.id} className="aspect-square">
            <button
              type="button"
              onClick={() => setOpenIndex(idx)}
              className="border-line hover:border-gold focus-visible:ring-gold/40 group relative block h-full w-full overflow-hidden rounded-lg border bg-white transition-colors focus-visible:ring-2 focus-visible:outline-none"
              style={{ borderWidth: "0.5px" }}
              aria-label={`${p.nickname} 님의 사진 확대 보기`}
              data-testid={`photo-trigger-${p.id}`}
            >
              <Image
                src={p.url}
                alt={p.caption ? p.caption : `${p.nickname} 님의 사진`}
                fill
                sizes="(max-width: 480px) 33vw, 160px"
                className="object-cover transition-transform group-hover:scale-[1.02]"
                data-testid={`photo-img-${p.id}`}
              />
            </button>
          </li>
        ))}
      </ul>

      <Lightbox
        open={openIndex !== null}
        index={openIndex ?? 0}
        close={() => setOpenIndex(null)}
        plugins={[Zoom]}
        slides={items.map((p) => ({
          src: p.url,
          alt: p.caption ?? `${p.nickname} 님의 사진`,
          width: p.width,
          height: p.height,
          description: p.caption
            ? `${p.nickname} · ${p.caption}`
            : p.nickname,
        }))}
        controller={{ closeOnBackdropClick: true }}
        carousel={{
          finite: true,
          imageProps: {
            style: { width: "100%", height: "100%", objectFit: "contain" },
          },
        }}
        zoom={{
          // 모바일 핀치/더블탭 + 데스크탑 휠/더블클릭으로 확대.
          maxZoomPixelRatio: 3,
          scrollToZoom: true,
          doubleTapDelay: 250,
          doubleClickDelay: 250,
        }}
      />
    </>
  );
};

export default PhotosGallery;
