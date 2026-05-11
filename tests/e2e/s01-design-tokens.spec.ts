import { expect, test } from "@playwright/test";

test.describe("S01 · 디자인 토큰 + 글로벌 레이아웃", () => {
  test("body 가 ink (#0a0a0c) 베이스 위에 그라디언트 + 노이즈 오버레이를 갖는다", async ({
    page,
  }) => {
    await page.goto("/");

    // body 의 base background-color 는 ink (#0a0a0c → rgb(10,10,12))
    const bg = await page.evaluate(() => {
      const cs = getComputedStyle(document.body);
      return {
        color: cs.backgroundColor,
        image: cs.backgroundImage,
      };
    });
    expect(bg.color).toBe("rgb(10, 10, 12)");
    // body background 는 burgundy/gold radial + 세로 linear 그라디언트
    expect(bg.image).toContain("radial-gradient");
    expect(bg.image).toContain("linear-gradient");

    // BackgroundLayer 노이즈 오버레이 (fixed, mix-blend-overlay)
    const overlay = page.locator('div[aria-hidden][class*="fixed"]').first();
    await expect(overlay).toBeAttached();
    const overlayBg = await overlay.evaluate(
      (el) => getComputedStyle(el).backgroundImage,
    );
    expect(overlayBg).toContain("svg");
  });

  test("본문이 Noto Serif KR 폰트 family 로 렌더된다", async ({ page }) => {
    await page.goto("/");
    const fontFamily = await page.locator("body").evaluate((el) => {
      return getComputedStyle(el).fontFamily;
    });
    expect(fontFamily).toMatch(/Noto Serif KR/i);
  });

  test("viewport meta 가 device-width + maximum-scale=5 로 설정된다 (S14: a11y 완화)", async ({
    page,
  }) => {
    await page.goto("/");
    const content = await page
      .locator('meta[name="viewport"]')
      .getAttribute("content");
    expect(content).toContain("width=device-width");
    expect(content).toContain("initial-scale=1");
    // user-scalable=no 는 WCAG 1.4.4 위반이라 5x 까지 허용. iOS auto-zoom 은
    // input font-size 16px+ 로 별도 방지.
    expect(content).toContain("maximum-scale=5");
    expect(content).not.toMatch(/user-scalable=no/);
  });

  test("Stage 컨테이너가 max-width 560px 로 제한된다", async ({ page }) => {
    await page.goto("/");
    const main = page.locator("main").first();
    const maxWidth = await main.evaluate(
      (el) => getComputedStyle(el).maxWidth,
    );
    expect(maxWidth).toBe("560px");
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
