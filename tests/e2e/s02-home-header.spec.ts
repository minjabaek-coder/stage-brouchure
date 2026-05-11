import { expect, test } from "@playwright/test";

test.describe("S02 · 홈 헤더 + 푸터 (FR-G01)", () => {
  test("헤더에 prelude/타이틀/서브타이틀이 모두 노출된다", async ({ page }) => {
    await page.goto("/");
    const header = page.getByTestId("home-header");

    await expect(header).toContainText("협력단체와 함께하는 앙상블의 향연");
    await expect(header).toContainText("Harmony Concert");
    // h1 은 어울림 + 콘서트 두 부분으로 분리 렌더되므로 각각 검사
    await expect(header.locator("h1")).toContainText("어울림");
    await expect(header.getByTestId("title-ko-highlight")).toHaveText("콘서트");
    await expect(header).toContainText("A Symphony of Souls in Concord");
  });

  test("메타 영역에 DATE/VENUE/TIME 값이 노출된다", async ({ page }) => {
    await page.goto("/");
    const header = page.getByTestId("home-header");

    await expect(header).toContainText("DATE");
    await expect(header).toContainText("VENUE");
    await expect(header).toContainText("TIME");
    await expect(header).toContainText("2026 · 5 · 26");
    await expect(header).toContainText("송파문화예술회관");
    await expect(header).toContainText("PM 7:30");
  });

  test("푸터에 주최(사단법인 한국예술가곡총연합회)가 노출된다", async ({
    page,
  }) => {
    await page.goto("/");
    const footer = page.getByTestId("home-footer");
    await expect(footer).toContainText("WELCOME TO THE EVENING");
    await expect(footer).toContainText("(사)한국예술가곡총연합회");
  });

  test("모바일(iPhone 13 viewport) 에서도 가로 스크롤이 발생하지 않는다", async ({
    page,
  }) => {
    // 프로젝트의 mobile-chromium 은 이미 모바일 viewport. 추가로 320 까지 좁혀서도 확인.
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(overflow).toBe(false);
  });
});
