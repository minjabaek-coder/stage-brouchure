import { type FC } from "react";
import { prisma } from "@/lib/db";
import SeatMapLightbox from "@/components/public/SeatMapLightbox";

const ALT = "어울림콘서트 좌석 배치도";

/** Resolves seat_map asset → SeatMapLightbox or a placeholder. */
const SeatMapImage: FC = async () => {
  const asset = await prisma.asset.findUnique({ where: { key: "seat_map" } });

  return (
    <section
      id="seatmap-section"
      aria-labelledby="seatmap-heading"
      className="mt-2"
      data-testid="seatmap-section"
    >
      <h2 id="seatmap-heading" className="sr-only">
        좌석배치도
      </h2>

      {asset ? (
        <SeatMapLightbox url={asset.url} alt={ALT} />
      ) : (
        <div
          className="text-muted rounded-2xl border border-dashed border-[#d4d0c4] bg-white px-5 py-10 text-center text-sm leading-[1.7]"
          data-testid="seatmap-placeholder"
        >
          <p className="text-gold mb-2 text-[12px] font-medium tracking-[0.2em] uppercase">
            Coming soon
          </p>
          좌석배치도가 곧 업로드됩니다.
        </div>
      )}
    </section>
  );
};

export default SeatMapImage;
