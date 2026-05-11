"use client";

import Image from "next/image";
import { type FC, useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Ornament from "@/components/ui/Ornament";

interface BrochureGalleryProps {
  /** 8 brochure asset URLs in display order. */
  urls: string[];
}

/**
 * Vertical scroller with 8 next/image renders + page numbers + ornaments.
 * Tapping any page opens yet-another-react-lightbox at that index, with
 * prev/next navigation enabled (S08 disabled them for the single seat map).
 *
 * First image gets `priority` (LCP), the rest are lazy-loaded — verified by
 * the S09 e2e (`loading=lazy` attribute on slides 2–8).
 */
const BrochureGallery: FC<BrochureGalleryProps> = ({ urls }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const total = urls.length;

  return (
    <>
      <div className="flex flex-col gap-10" data-testid="brochure-gallery">
        {urls.map((url, idx) => {
          const isFirst = idx === 0;
          const isLast = idx === total - 1;
          const pageNum = String(idx + 1).padStart(2, "0");
          return (
            <figure key={url} className="flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={() => setOpenIndex(idx)}
                className="border-gold/30 hover:border-gold focus-visible:ring-gold/40 group block w-full overflow-hidden rounded-[2px] border bg-[rgba(244,237,224,0.05)] p-1.5 transition-colors focus-visible:ring-2 focus-visible:outline-none"
                aria-label={`브로셔 ${pageNum} 확대 보기`}
                data-testid={`brochure-trigger-${pageNum}`}
              >
                <Image
                  src={url}
                  alt={`어울림콘서트 브로셔 ${pageNum}`}
                  width={800}
                  height={1100}
                  unoptimized={url.endsWith(".svg")}
                  priority={isFirst}
                  loading={isFirst ? "eager" : "lazy"}
                  sizes="(max-width: 560px) 100vw, 560px"
                  className="block h-auto w-full transition-transform duration-500 group-hover:scale-[1.01]"
                  data-testid={`brochure-img-${pageNum}`}
                />
              </button>

              <figcaption
                className="font-serif-en text-gold text-[12px] tracking-[0.3em] italic"
                data-testid={`brochure-pagenum-${pageNum}`}
              >
                {String(idx + 1)} / {total}
              </figcaption>

              {!isLast && <Ornament className="mt-2 mb-0" />}
            </figure>
          );
        })}
      </div>

      <Lightbox
        open={openIndex !== null}
        index={openIndex ?? 0}
        close={() => setOpenIndex(null)}
        slides={urls.map((src, i) => ({
          src,
          alt: `어울림콘서트 브로셔 ${String(i + 1).padStart(2, "0")}`,
          // 큰 reference + imageProps width/height 100%: 자연 크기가 작은
          // 이미지(예: SVG)도 viewport 를 채우도록 강제. 자세한 이유는
          // SeatMapLightbox 의 같은 옵션 주석 참조.
          width: 2400,
          height: 3300,
        }))}
        controller={{ closeOnBackdropClick: true }}
        carousel={{
          finite: true,
          imageProps: {
            style: { width: "100%", height: "100%", objectFit: "contain" },
          },
        }}
      />
    </>
  );
};

export default BrochureGallery;
