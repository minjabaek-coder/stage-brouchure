import { EVENT } from "@/lib/event";

/**
 * Calendar helpers — ICS file building + Google Calendar deeplink.
 * Both consume the canonical ISO datetimes on EVENT (KST) and emit UTC
 * `YYYYMMDDTHHmmssZ` strings, which every calendar app handles.
 */

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";

const SUMMARY = `${EVENT.titleKo} ${EVENT.ornament}`; // "어울림 콘서트 2026 정기연주회"
const LOCATION = EVENT.venueShort;
const DESCRIPTION = `${EVENT.organizer} · ${SITE_URL}`;
const UID_HOST = (() => {
  try {
    return new URL(SITE_URL).hostname || "eoullim.local";
  } catch {
    return "eoullim.local";
  }
})();
const UID = `eoullim-concert-${EVENT.eventDateIso}@${UID_HOST}`;

function toIcsUtc(iso: string): string {
  // "2026-05-26T19:30:00+09:00" → "20260526T103000Z"
  const date = new Date(iso);
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  const hh = String(date.getUTCHours()).padStart(2, "0");
  const mm = String(date.getUTCMinutes()).padStart(2, "0");
  const ss = String(date.getUTCSeconds()).padStart(2, "0");
  return `${y}${m}${d}T${hh}${mm}${ss}Z`;
}

function escapeIcs(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

/** Build a valid VCALENDAR/VEVENT body. CRLF line endings per RFC 5545. */
export function buildIcs(): string {
  const dtStart = toIcsUtc(EVENT.eventStartIso);
  const dtEnd = toIcsUtc(EVENT.eventEndIso);
  const dtStamp = toIcsUtc(new Date().toISOString());

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//eoullim//concert//KR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${UID}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${escapeIcs(SUMMARY)}`,
    `LOCATION:${escapeIcs(LOCATION)}`,
    `DESCRIPTION:${escapeIcs(DESCRIPTION)}`,
    `URL:${SITE_URL}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.join("\r\n") + "\r\n";
}

/** Google Calendar "add event" deeplink — opens render?action=TEMPLATE. */
export function buildGoogleCalendarUrl(): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: SUMMARY,
    dates: `${toIcsUtc(EVENT.eventStartIso)}/${toIcsUtc(EVENT.eventEndIso)}`,
    details: DESCRIPTION,
    location: LOCATION,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
