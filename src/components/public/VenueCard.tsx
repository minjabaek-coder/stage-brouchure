import { type FC } from "react";
import { getVenue } from "@/lib/venue";
import VenueIllustration from "@/components/public/VenueIllustration";

/**
 * Venue card with parametric SVG illustration (subway line + stations + exit
 * + walk distance + venue pin). Admin can edit all values via /admin; no
 * image upload required. Tap area opens the configured map URL in a new tab.
 */
const VenueCard: FC = async () => {
  const venue = await getVenue();
  return (
    <section className="pt-1.5 pb-9" data-testid="venue-card">
      <p className="text-muted mb-3 text-[15px] font-medium">
        공연장에 찾아오시는 길
      </p>
      <p
        className="text-muted-light mb-4 text-[13px] leading-[1.6]"
        data-testid="venue-parking-notice"
      >
        주차공간이 협소한 관계로 가급적 대중교통 이용바랍니다.
      </p>
      <a
        href={venue.mapUrl}
        target="_blank"
        rel="noopener"
        className="border-line block overflow-hidden rounded-2xl"
        style={{ borderWidth: "0.5px" }}
        data-testid="venue-link"
      >
        <div
          className="relative aspect-[600/620] w-full overflow-hidden bg-[#F5EFE2]"
          data-testid="venue-map-preview"
        >
          <VenueIllustration
            line={venue.line}
            prevStation={venue.prevStation || undefined}
            destStation={venue.destStation}
            exit={venue.exit}
            walkDistance={venue.walkDistance}
            venueName={venue.name}
          />
        </div>
        <div className="bg-paper flex items-center justify-between gap-3 px-[22px] py-5">
          <div>
            <div
              className="text-ink mb-1.5 text-[18px] font-medium tracking-[-0.01em]"
              data-testid="venue-name"
            >
              {venue.name}
            </div>
            <div
              className="text-muted text-[14px] leading-[1.5] whitespace-pre-line"
              data-testid="venue-address"
            >
              {venue.address}
            </div>
          </div>
          <div className="text-ink flex shrink-0 items-center gap-1.5 text-[14px] font-medium">
            <span>길찾기</span>
            <i className="ti ti-external-link text-[16px]" />
          </div>
        </div>
      </a>
    </section>
  );
};

export default VenueCard;
