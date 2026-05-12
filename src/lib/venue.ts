import { prisma } from "@/lib/db";
import { EVENT } from "@/lib/event";

export interface VenueInfo {
  name: string;
  address: string;
  mapUrl: string;
}

/**
 * Resolve venue info from the assets table (admin-editable). Falls back to
 * EVENT defaults when keys are missing — so a fresh deploy still renders
 * something sensible before the operator edits.
 *
 * Keys (assets.key):
 *   - `venue_name`     : 송파문화예술회관 (or operator override)
 *   - `venue_address`  : 줄바꿈 허용 (UI 에서 whitespace-pre-line)
 *   - `venue_map_url`  : naver/kakao 지도 deeplink
 */
export async function getVenue(): Promise<VenueInfo> {
  const rows = await prisma.asset.findMany({
    where: { key: { in: ["venue_name", "venue_address", "venue_map_url"] } },
  });
  const byKey = new Map(rows.map((r) => [r.key, r.url]));
  return {
    name: byKey.get("venue_name") ?? EVENT.venueName,
    address: byKey.get("venue_address") ?? EVENT.venueAddress,
    mapUrl: byKey.get("venue_map_url") ?? EVENT.venueMapUrl,
  };
}
