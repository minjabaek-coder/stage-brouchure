import { expect, test } from "@playwright/test";

test.describe("S09 · 브로셔 페이지 (FR-G06)", () => {
  test("/brochure 진입 시 8장이 순서대로 노출된다", async ({ page }) => {
    await page.goto("/brochure");
    const gallery = page.getByTestId("brochure-gallery");
    await expect(gallery).toBeVisible();

    for (let i = 1; i <= 8; i++) {
      const padded = String(i).padStart(2, "0");
      const img = page.getByTestId(`brochure-img-${padded}`);
      await expect(img).toBeAttached();
      const src = await img.getAttribute("src");
      expect(src).toContain(`brochure-${padded}.svg`);
    }
  });

  test("첫 이미지는 priority/eager, 2번째 이후는 lazy 로 로드된다", async ({
    page,
  }) => {
    await page.goto("/brochure");

    const first = page.getByTestId("brochure-img-01");
    await expect(first).toHaveAttribute("loading", "eager");

    for (let i = 2; i <= 8; i++) {
      const padded = String(i).padStart(2, "0");
      await expect(page.getByTestId(`brochure-img-${padded}`)).toHaveAttribute(
        "loading",
        "lazy",
      );
    }
  });

  test("페이지 번호 1/8 ~ 8/8 모두 노출된다", async ({ page }) => {
    await page.goto("/brochure");
    for (let i = 1; i <= 8; i++) {
      const padded = String(i).padStart(2, "0");
      await expect(
        page.getByTestId(`brochure-pagenum-${padded}`),
      ).toHaveText(`${i} / 8`);
    }
  });

  test("3번째 이미지 클릭 → 라이트박스가 3장째에서 열린다", async ({ page }) => {
    await page.goto("/brochure");

    // lazy 로 마운트된 이미지가 viewport 에 들어와야 인터랙션 가능
    await page.getByTestId("brochure-trigger-03").scrollIntoViewIfNeeded();
    await page.getByTestId("brochure-trigger-03").click();

    const portal = page.locator(".yarl__portal");
    await expect(portal).toBeVisible();
    // 슬라이드의 alt 가 "어울림콘서트 브로셔 03"
    await expect(portal.getByAltText("어울림콘서트 브로셔 03")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(portal).toHaveCount(0);
  });

  test("라이트박스 내 좌/우 네비게이션이 활성화된다 (8장이라 prev/next 버튼 노출)", async ({
    page,
  }) => {
    await page.goto("/brochure");
    await page.getByTestId("brochure-trigger-01").click();

    const portal = page.locator(".yarl__portal");
    await expect(portal).toBeVisible();
    // yet-another-react-lightbox 의 next 버튼
    const next = portal.locator(".yarl__button[aria-label='Next']");
    await expect(next).toBeVisible();

    await next.click();
    await expect(portal.getByAltText("어울림콘서트 브로셔 02")).toBeVisible();
  });
});
