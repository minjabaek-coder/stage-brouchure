import { expect, test } from "@playwright/test";

test.describe("S01 · 디자인 토큰 + 글로벌 레이아웃 (라이트 테마)", () => {
  test("body 가 canvas (#F0EEE7) 베이스", async ({ page }) => {
    await page.goto("/");
    const bg = await page
      .locator("body")
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    // #F0EEE7 → rgb(240, 238, 231)
    expect(bg).toBe("rgb(240, 238, 231)");
  });

  test("본문이 Noto Sans KR 폰트 family 로 렌더된다", async ({ page }) => {
    await page.goto("/");
    const fontFamily = await page
      .locator("body")
      .evaluate((el) => getComputedStyle(el).fontFamily);
    expect(fontFamily).toMatch(/Noto Sans KR/i);
  });

  test("viewport meta 가 device-width + maximum-scale=5 로 설정된다 (a11y)", async ({
    page,
  }) => {
    await page.goto("/");
    const content = await page
      .locator('meta[name="viewport"]')
      .getAttribute("content");
    expect(content).toContain("width=device-width");
    expect(content).toContain("initial-scale=1");
    expect(content).toContain("maximum-scale=5");
    expect(content).not.toMatch(/user-scalable=no/);
  });

  test("Stage 컨테이너가 max-width 480px 로 제한된다", async ({ page }) => {
    await page.goto("/");
    const main = page.locator("main").first();
    const maxWidth = await main.evaluate(
      (el) => getComputedStyle(el).maxWidth,
    );
    expect(maxWidth).toBe("480px");
  });

  test("모바일 viewport (320px) 에서 가로 스크롤이 발생하지 않는다", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto("/");
    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(overflow).toBe(false);
  });
});
