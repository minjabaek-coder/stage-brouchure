import { type FC } from "react";
import { prisma } from "@/lib/db";
import SeatMapLightbox from "@/components/public/SeatMapLightbox";

const ALT = "어울림콘서트 좌석 배치도";

/**
 * Server component that resolves the current seat map asset from Postgres and
 * either mounts the click-to-zoom lightbox (S12 admin upload feeds this) or
 * renders a dashed placeholder card while no asset has been uploaded yet
 * (PRD §3.5.2).
 */
const SeatMapImage: FC = async () => {
  const asset = await prisma.asset.findUnique({ where: { key: "seat_map" } });

  return (
    <section
      id="seatmap-section"
      aria-labelledby="seatmap-heading"
      className="mt-10"
      data-testid="seatmap-section"
    >
      <h2
        id="seatmap-heading"
        className="font-serif-en text-gold mb-3 text-center text-[12px] tracking-[0.3em] uppercase italic"
      >
        — Seat Map —
      </h2>

      {asset ? (
        <SeatMapLightbox url={asset.url} alt={ALT} />
      ) : (
        <div
          className="font-serif-ko text-paper/55 rounded-[2px] border border-dashed border-[rgba(197,165,114,0.3)] px-5 py-10 text-center text-sm leading-[1.7]"
          data-testid="seatmap-placeholder"
        >
          <p className="font-serif-en text-gold mb-2 text-[13px] tracking-[0.2em] italic">
            — Coming soon —
          </p>
          좌석배치도가 곧 업로드됩니다.
        </div>
      )}
    </section>
  );
};

export default SeatMapImage;
