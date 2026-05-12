import { prisma } from "@/lib/db";
import { EVENT } from "@/lib/event";

export interface VenueInfo {
  name: string;
  /** 지하철 호선 (예: "9호선") */
  line: string;
  /** 이전 정거장 이름 (선택 — 디자인상의 비교 정거장. 비우면 SVG 에서 단일 정거장으로 렌더) */
  prevStation: string;
  /** 도착 정거장 이름 (예: "석촌고분역"). VenueIllustration 의 burgundy 강조 정거장. */
  destStation: string;
  /** 출구 (예: "4번 출구") */
  exit: string;
  /** 도보 거리 (예: "도보 300m") */
  walkDistance: string;
  /** 상세 주소 (줄바꿈 허용; venue-info 우측 텍스트로 표시) */
  address: string;
  /** 외부 지도 deeplink (네이버/카카오) */
  mapUrl: string;
}

/**
 * Resolve venue info from the assets table (admin-editable). Falls back to
 * EVENT defaults when keys are missing — so a fresh deploy still renders
 * something sensible before the operator edits.
 *
 * Asset keys (assets.key) consumed:
 *   venue_name / venue_line / venue_prev_station / venue_dest_station /
 *   venue_exit / venue_walk_distance / venue_address / venue_map_url
 */
export const VENUE_KEYS = [
  "venue_name",
  "venue_line",
  "venue_prev_station",
  "venue_dest_station",
  "venue_exit",
  "venue_walk_distance",
  "venue_address",
  "venue_map_url",
] as const;
export type VenueKey = (typeof VENUE_KEYS)[number];

export async function getVenue(): Promise<VenueInfo> {
  const rows = await prisma.asset.findMany({
    where: { key: { in: [...VENUE_KEYS] } },
  });
  const byKey = new Map(rows.map((r) => [r.key, r.url]));
  return {
    name: byKey.get("venue_name") ?? EVENT.venueName,
    line: byKey.get("venue_line") ?? EVENT.venueLine,
    prevStation: byKey.get("venue_prev_station") ?? EVENT.venuePrevStation,
    destStation: byKey.get("venue_dest_station") ?? EVENT.venueDestStation,
    exit: byKey.get("venue_exit") ?? EVENT.venueExit,
    walkDistance: byKey.get("venue_walk_distance") ?? EVENT.venueWalkDistance,
    address: byKey.get("venue_address") ?? EVENT.venueAddress,
    mapUrl: byKey.get("venue_map_url") ?? EVENT.venueMapUrl,
  };
}
