import { type FC } from "react";
import { getVenue } from "@/lib/venue";

/**
 * Venue card with stylized SVG map mockup + Naver Maps deeplink. The actual
 * map is intentionally not embedded (no API key required, faster load); a
 * tap opens map.naver.com in a new tab.
 *
 * Admin can edit venue name / address / map URL via /admin (assets table).
 */
const VenueCard: FC = async () => {
  const venue = await getVenue();
  return (
    <section className="pt-1.5 pb-9" data-testid="venue-card">
      <p className="text-muted mb-4 text-[15px] font-medium">공연장</p>
      <a
        href={venue.mapUrl}
        target="_blank"
        rel="noopener"
        className="border-line block overflow-hidden rounded-2xl"
        style={{ borderWidth: "0.5px" }}
        data-testid="venue-link"
      >
        <div className="relative h-[200px] overflow-hidden bg-[#EFEDE7]">
          <svg
            viewBox="0 0 400 200"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden
            className="block h-full w-full"
          >
            <rect width="400" height="200" fill="#EFEDE7" />
            <path d="M 0 70 L 400 60" stroke="#DAD6CC" strokeWidth="1" fill="none" />
            <path d="M 0 140 L 400 150" stroke="#DAD6CC" strokeWidth="1" fill="none" />
            <path d="M 80 0 L 90 200" stroke="#DAD6CC" strokeWidth="1" fill="none" />
            <path d="M 250 0 L 240 200" stroke="#DAD6CC" strokeWidth="1" fill="none" />
            <path d="M 320 0 L 330 200" stroke="#DAD6CC" strokeWidth="1" fill="none" />
            <rect x="20" y="25" width="40" height="24" fill="#E4E0D5" />
            <rect x="120" y="80" width="60" height="42" fill="#E4E0D5" />
            <rect x="280" y="22" width="30" height="22" fill="#E4E0D5" />
            <rect x="280" y="158" width="50" height="30" fill="#E4E0D5" />
            <rect x="350" y="70" width="40" height="56" fill="#E4E0D5" />
            <text
              x="22"
              y="190"
              fill="#A8A496"
              fontSize="11"
              fontFamily="sans-serif"
            >
              탭하면 네이버 지도로 연결됩니다
            </text>
          </svg>
          {/* Pin */}
          <div className="absolute top-1/2 left-1/2 z-[2] -translate-x-1/2 -translate-y-full">
            <div className="bg-ink flex h-8 w-8 items-center justify-center rounded-[50%_50%_50%_0] [transform:rotate(-45deg)]">
              <span className="bg-paper h-3 w-3 rounded-full [transform:rotate(45deg)]" />
            </div>
          </div>
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
