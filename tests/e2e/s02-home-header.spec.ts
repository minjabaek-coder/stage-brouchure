import { expect, test } from "@playwright/test";

test.describe("S02 · 홈 헤더 + 푸터 (FR-G01) — 라이트 테마", () => {
  test("헤더에 prelude + 로고 이미지 + ornament 가 노출된다", async ({ page }) => {
    await page.goto("/");
    const header = page.getByTestId("home-header");

    await expect(header).toContainText("협력단체와 함께하는 앙상블의 향연");
    await expect(header).toContainText("2026 정기연주회");
    // 로고는 이미지 (alt=어울림 콘서트)
    const heroImg = page.getByTestId("hero-title");
    await expect(heroImg).toBeVisible();
    await expect(heroImg).toHaveAttribute("alt", /어울림 콘서트/);
  });

  test("메타 strip 에 날짜/시간/장소 값이 노출된다", async ({ page }) => {
    await page.goto("/");
    const meta = page.getByTestId("event-meta");
    await expect(meta).toContainText("날짜");
    await expect(meta).toContainText("시간");
    await expect(meta).toContainText("장소");
    await expect(meta).toContainText("2026. 5. 26");
    await expect(meta).toContainText("오후 7:30");
    await expect(meta).toContainText("송파문화예술회관");
  });

  test("푸터에 주최 + 카피라이트 + 문의 연락처가 노출된다", async ({ page }) => {
    await page.goto("/");
    const footer = page.getByTestId("home-footer");
    await expect(footer).toContainText("(사)한국예술가곡총연합회");
    await expect(footer).toContainText("이런 앱이 필요하신가요?");
    await expect(footer).toContainText("010-8488-3178");
    await expect(footer).toContainText("master@kairosse.com");
    await expect(footer).toContainText("© 2026 어울림콘서트");
  });

  test("biz-card 에 두 스폰서 로고가 노출된다", async ({ page }) => {
    await page.goto("/");
    const biz = page.getByTestId("biz-card");
    await expect(biz).toBeVisible();
    await expect(page.getByTestId("biz-burgundy")).toBeVisible();
    await expect(page.getByTestId("biz-paper")).toBeVisible();
    await expect(biz).toContainText("(주)아트컴퍼니본");
    await expect(biz).toContainText("(주)카이로스팀");
  });

  test("공연장 카드에 이름/주소/지도 link 가 노출된다", async ({ page }) => {
    await page.goto("/");
    const venue = page.getByTestId("venue-card");
    await expect(venue).toBeVisible();
    await expect(page.getByTestId("venue-name")).toContainText("송파문화예술회관");
    await expect(page.getByTestId("venue-address")).toContainText("석촌고분");
    const link = page.getByTestId("venue-link");
    const href = await link.getAttribute("href");
    expect(href).toMatch(/map\.naver\.com/);
  });

  test("모바일(375px viewport) 에서도 가로 스크롤이 발생하지 않는다", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(overflow).toBe(false);
  });
});
