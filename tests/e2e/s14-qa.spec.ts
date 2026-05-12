import { expect, test, devices } from "@playwright/test";
import { PrismaClient } from "@prisma/client";

/**
 * S14 · 최종 QA — PRD §9 체크리스트 자동화 가능 항목 + 전체 사용자 여정 + viewport 매트릭스.
 *
 * 외부 환경/실기기 항목은 별도 (수동):
 *  - Lighthouse CI (LCP/a11y/best-practices)
 *  - 카카오톡 인앱 브라우저 (영상·라이트박스)
 *  - 100동접 부하 시뮬레이션
 */

// S11 의 CSV 업로드가 attendees 를 갈아엎으므로, S14 의 검색 시나리오가
// 의존하는 신귀복/0001/A-1 row 를 매 테스트 직전에 멱등 upsert 한다.
const prisma = new PrismaClient({
  datasources: {
    db: {
      url:
        process.env.DATABASE_URL_TEST ??
        "postgresql://kai@localhost:5432/eoullim_test",
    },
  },
});

test.beforeAll(async () => {
  // schema 에 (name, phoneLast4) unique 가 없고 index 만 있으므로 수동 upsert.
  const existing = await prisma.attendee.findFirst({
    where: { name: "신귀복", phoneLast4: "0001" },
  });
  if (existing) {
    await prisma.attendee.update({
      where: { id: existing.id },
      data: { seat: "A-1", note: "이사장석" },
    });
  } else {
    await prisma.attendee.create({
      data: {
        name: "신귀복",
        phoneLast4: "0001",
        seat: "A-1",
        note: "이사장석",
      },
    });
  }
});

test.afterAll(async () => {
  await prisma.$disconnect();
});

test.describe("S14 · OG 이미지 + sitemap (NFR-08)", () => {
  test("/sitemap.xml 가 200 + / /search /brochure 만 포함, /admin 은 제외", async ({
    request,
  }) => {
    const res = await request.get("/sitemap.xml");
    expect(res.status()).toBe(200);
    const xml = await res.text();
    expect(xml).toContain("<loc>http://localhost:3000/</loc>");
    expect(xml).toContain("/search");
    expect(xml).toContain("/brochure");
    expect(xml).not.toContain("/admin");
  });

  test("/opengraph-image 가 200 + image/png 응답", async ({ request }) => {
    const res = await request.get("/opengraph-image");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toMatch(/image\/png/);
    const body = await res.body();
    // edge runtime ImageResponse 가 실제 PNG 를 반환했는지 매직넘버 확인
    expect(body.subarray(0, 4).toString("hex")).toBe("89504e47");
  });

  test("robots.txt 가 sitemap 을 안내한다", async ({ request }) => {
    const res = await request.get("/robots.txt");
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain("Disallow: /admin");
    expect(body).toContain("Sitemap: /sitemap.xml");
  });
});

test.describe("S14 · 전체 사용자 여정 (PRD §9)", () => {
  test("홈 → 영상 재생 → 자리 찾기 (성공) → 좌석맵 라이트박스 → 브로셔 8장 → 메인 복귀", async ({
    page,
  }) => {
    // ---- 1) 홈 ----
    await page.goto("/");
    await expect(page.locator("body")).toContainText("어울림");
    await expect(page.locator("body")).toContainText("2026 정기연주회");

    // ---- 2) 영상 인라인 재생 ----
    const thumb = page.getByTestId("video-thumb");
    await expect(thumb).toBeVisible();
    await expect(page.locator("iframe")).toHaveCount(0);
    await thumb.click();
    await expect(
      page.locator('iframe[src*="youtube.com/embed/0aT4IdHXZW8"]'),
    ).toBeVisible();

    // ---- 3) 자리 찾기 (성공) ----
    await page.goto("/");
    await page.getByTestId("menu-card-search").click();
    await expect(page).toHaveURL(/\/search$/);
    await page.locator("#search-name").fill("신귀복");
    await page.locator("#search-phone").fill("0001");
    await page.getByTestId("search-submit").click();
    await expect(page.getByTestId("seat-result-card")).toBeVisible();
    await expect(page.getByTestId("result-seat")).toHaveText("A-1");

    // ---- 4) 좌석맵 라이트박스 ----
    const trigger = page.getByTestId("seatmap-trigger");
    await expect(trigger).toBeVisible();
    await trigger.click();
    // yet-another-react-lightbox 는 role="presentation" overlay 를 렌더한다
    await expect(page.locator(".yarl__container")).toBeVisible();
    await page.keyboard.press("Escape");

    // ---- 5) 브로셔 8장 ----
    await page.goto("/brochure");
    for (let i = 1; i <= 8; i++) {
      const padded = String(i).padStart(2, "0");
      await expect(page.getByTestId(`brochure-img-${padded}`)).toBeVisible();
      await expect(page.getByTestId(`brochure-pagenum-${padded}`)).toContainText(
        `${i} / 8`,
      );
    }

    // ---- 6) 메인 복귀 ----
    await page.getByTestId("back-button").click();
    await expect(page).toHaveURL(/\/$/);
  });

  test("자리 찾기 실패 시 안내 메시지가 동일하게 노출된다 (PRD §2.2.5)", async ({
    page,
  }) => {
    await page.goto("/search");

    // 잘못된 이름
    await page.locator("#search-name").fill("없는사람");
    await page.locator("#search-phone").fill("0001");
    await page.getByTestId("search-submit").click();
    await expect(page.getByTestId("no-result-card")).toContainText(
      "일치하는 정보를 찾을 수 없습니다",
    );

    // 잘못된 전화 — 메시지 동일
    await page.locator("#search-name").fill("신귀복");
    await page.locator("#search-phone").fill("9999");
    await page.getByTestId("search-submit").click();
    await expect(page.getByTestId("no-result-card")).toContainText(
      "일치하는 정보를 찾을 수 없습니다",
    );
  });
});

test.describe("S14 · viewport 매트릭스 (NFR-01 모바일 우선)", () => {
  const viewports = [
    { name: "iPhone SE (320×568)", viewport: { width: 320, height: 568 } },
    { name: "iPhone 13 (390×844)", viewport: devices["iPhone 13"].viewport },
    { name: "iPad (768×1024)", viewport: devices["iPad (gen 7)"].viewport },
  ];

  for (const { name, viewport } of viewports) {
    test(`${name}: 홈/검색/브로셔에 가로 스크롤 없음`, async ({ browser }) => {
      const ctx = await browser.newContext({ viewport });
      const page = await ctx.newPage();
      try {
        for (const path of ["/", "/search", "/brochure"]) {
          await page.goto(path);
          const overflow = await page.evaluate(
            () => document.documentElement.scrollWidth > window.innerWidth + 1,
          );
          expect(overflow, `${path} @ ${name} 가로 스크롤`).toBe(false);
        }
      } finally {
        await ctx.close();
      }
    });
  }
});
