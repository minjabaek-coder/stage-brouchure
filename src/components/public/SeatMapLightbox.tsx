"use client";

import Image from "next/image";
import { type FC, useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

interface SeatMapLightboxProps {
  url: string;
  alt: string;
}

/**
 * Click-to-zoom seat map. Renders an inline next/image that swaps to a
 * fullscreen yet-another-react-lightbox on click (FR-G04). Mobile pinch-zoom
 * inside the lightbox is the library default.
 */
const SeatMapLightbox: FC<SeatMapLightboxProps> = ({ url, alt }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="border-gold/30 hover:border-gold focus-visible:ring-gold/40 group block w-full overflow-hidden rounded-[2px] border bg-[rgba(26,22,18,0.55)] p-2 transition-colors focus-visible:ring-2 focus-visible:outline-none"
        aria-label="좌석 배치도 확대 보기"
        data-testid="seatmap-trigger"
      >
        <Image
          src={url}
          alt={alt}
          width={800}
          height={600}
          // Local SVGs need unoptimized — Next refuses to optimize SVG by default
          unoptimized={url.endsWith(".svg")}
          className="block h-auto w-full transition-transform duration-500 group-hover:scale-[1.01]"
          data-testid="seatmap-img"
          sizes="(max-width: 560px) 100vw, 560px"
        />
      </button>

      <Lightbox
        open={open}
        close={() => setOpen(false)}
        slides={[{ src: url, alt }]}
        controller={{ closeOnBackdropClick: true }}
        carousel={{ finite: true }}
        render={{
          buttonPrev: () => null,
          buttonNext: () => null,
        }}
      />
    </>
  );
};

export default SeatMapLightbox;
