import { expect, test } from "@playwright/test";

const EVENT_ISO = "2026-05-26";

function getKstYmd(): string {
  const now = new Date();
  const kstMs = now.getTime() + 9 * 60 * 60 * 1000;
  const kst = new Date(kstMs);
  const y = kst.getUTCFullYear();
  const m = String(kst.getUTCMonth() + 1).padStart(2, "0");
  const d = String(kst.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function expectedDdayText(todayYmd: string): string {
  const eventStart = new Date(EVENT_ISO + "T00:00:00+09:00").getTime();
  const todayStart = new Date(todayYmd + "T00:00:00+09:00").getTime();
  const diff = Math.round((eventStart - todayStart) / 86_400_000);
  if (diff > 0) return `D-${diff}`;
  if (diff === 0) return "D-DAY";
  return "연주회가";
}

test.describe("D-day + 캘린더 카드", () => {
  test("D-day 카드가 EventMeta 아래에 노출되고 오늘 기준 값이 표시된다", async ({
    page,
  }) => {
    await page.goto("/");
    const card = page.getByTestId("dday-card");
    await expect(card).toBeVisible();

    const expected = expectedDdayText(getKstYmd());
    await expect(page.getByTestId("dday-value")).toContainText(expected);
  });

  test("캘린더 카드 클릭 시 다이얼로그가 열리고 두 버튼이 노출된다", async ({
    page,
  }) => {
    await page.goto("/");
    const card = page.getByTestId("calendar-card");
    await expect(card).toBeVisible();

    await expect(page.getByTestId("calendar-dialog")).toBeHidden();
    await card.click();
    await expect(page.getByTestId("calendar-dialog")).toBeVisible();

    const ics = page.getByTestId("calendar-ics");
    const gcal = page.getByTestId("calendar-google");
    await expect(ics).toBeVisible();
    await expect(gcal).toBeVisible();
    await expect(ics).toHaveAttribute("href", "/api/calendar.ics");
    await expect(gcal).toHaveAttribute(
      "href",
      /calendar\.google\.com\/calendar\/render/,
    );
  });

  test("/api/calendar.ics 가 정상 ICS 본문을 반환한다", async ({ request }) => {
    const res = await request.get("/api/calendar.ics");
    expect(res.status()).toBe(200);
    const ct = res.headers()["content-type"] ?? "";
    expect(ct).toContain("text/calendar");
    const body = await res.text();
    expect(body).toContain("BEGIN:VCALENDAR");
    expect(body).toContain("END:VCALENDAR");
    expect(body).toContain("DTSTART:20260526T103000Z");
    expect(body).toContain("DTEND:20260526T130000Z");
    expect(body).toMatch(/UID:eoullim-concert-2026-05-26@/);
    expect(body).toContain("SUMMARY:어울림 콘서트 2026 정기연주회");
    expect(body).toContain("LOCATION:송파문화예술회관");
  });

  test("EventMeta 와 InvitationVideo 사이에 두 카드가 가로로 배치된다", async ({
    page,
  }) => {
    await page.goto("/");
    const wrap = page.getByTestId("save-the-date");
    await expect(wrap).toBeVisible();
    await expect(wrap.getByTestId("dday-card")).toBeVisible();
    await expect(wrap.getByTestId("calendar-card")).toBeVisible();
  });
});
