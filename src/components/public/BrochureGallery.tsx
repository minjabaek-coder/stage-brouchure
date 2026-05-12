"use client";

import Image from "next/image";
import { type FC, useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

interface BrochureGalleryProps {
  /** 8 brochure asset URLs in display order. */
  urls: string[];
}

/**
 * Vertical brochure scroller — 8 next/image renders + page number caption.
 * Spacing: gap-3 (12px) between figures. Per user feedback the previous
 * decorative Ornament separator between pages has been removed; the
 * caption (e.g. "3 / 8") remains.
 *
 * First image gets `priority` (LCP), the rest are lazy-loaded.
 */
const BrochureGallery: FC<BrochureGalleryProps> = ({ urls }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const total = urls.length;

  return (
    <>
      <div className="flex flex-col gap-3" data-testid="brochure-gallery">
        {urls.map((url, idx) => {
          const isFirst = idx === 0;
          const pageNum = String(idx + 1).padStart(2, "0");
          return (
            <figure key={url} className="flex flex-col items-center gap-1.5">
              <button
                type="button"
                onClick={() => setOpenIndex(idx)}
                className="border-line hover:border-gold focus-visible:ring-gold/40 group block w-full overflow-hidden rounded-2xl border bg-white p-1.5 transition-colors focus-visible:ring-2 focus-visible:outline-none"
                style={{ borderWidth: "0.5px" }}
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
                  sizes="(max-width: 480px) 100vw, 480px"
                  className="block h-auto w-full"
                  data-testid={`brochure-img-${pageNum}`}
                />
              </button>

              <figcaption
                className="text-gold text-[11px] font-medium tracking-[0.25em]"
                data-testid={`brochure-pagenum-${pageNum}`}
              >
                {String(idx + 1)} / {total}
              </figcaption>
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
