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
        className="border-line hover:border-gold focus-visible:ring-gold/40 group block w-full overflow-hidden rounded-2xl border bg-white p-2 transition-colors focus-visible:ring-2 focus-visible:outline-none"
        style={{ borderWidth: "0.5px" }}
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
        // slide.width/height: yarl 이 maxWidth=max(slide.width, naturalWidth).
        // imageProps: 기본은 max-* 만 잡아 자연 크기로만 렌더(작은 SVG/이미지가
        // viewport 를 못 채움). width/height 100% + object-fit:contain 으로
        // viewport 채우면서 aspect 는 유지.
        slides={[{ src: url, alt, width: 2400, height: 1800 }]}
        controller={{ closeOnBackdropClick: true }}
        carousel={{
          finite: true,
          imageProps: {
            style: { width: "100%", height: "100%", objectFit: "contain" },
          },
        }}
        render={{
          buttonPrev: () => null,
          buttonNext: () => null,
        }}
      />
    </>
  );
};

export default SeatMapLightbox;
