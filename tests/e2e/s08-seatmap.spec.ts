import { expect, test } from "@playwright/test";

const ALT = "어울림콘서트 좌석 배치도";

test.describe("S08 · 정적 좌석배치도 + 라이트박스 (FR-G04)", () => {
  test("/search 하단에 alt='어울림콘서트 좌석 배치도' 이미지가 노출된다", async ({
    page,
  }) => {
    await page.goto("/search");
    const img = page.getByAltText(ALT);
    await expect(img).toBeVisible();
  });

  test("이미지(트리거) 클릭 → 라이트박스 등장", async ({ page }) => {
    await page.goto("/search");
    await page.getByTestId("seatmap-trigger").click();

    // yet-another-react-lightbox 의 portal 컨테이너
    const portal = page.locator(".yarl__portal");
    await expect(portal).toBeVisible();
    // 라이트박스 내부에 동일 alt 의 이미지가 또 한 번 렌더된다
    await expect(portal.getByAltText(ALT)).toBeVisible();
  });

  test("라이트박스 닫기 버튼 → 원위치", async ({ page }) => {
    await page.goto("/search");
    await page.getByTestId("seatmap-trigger").click();
    await expect(page.locator(".yarl__portal")).toBeVisible();

    // 기본 라이트박스의 close 버튼 (aria-label 기준)
    await page.locator(".yarl__button[aria-label='Close']").click();

    // 라이트박스 portal 이 사라지거나(unmount) 보이지 않게 됨
    await expect(page.locator(".yarl__portal")).toHaveCount(0);
  });

  test("ESC 키로도 라이트박스가 닫힌다", async ({ page }) => {
    await page.goto("/search");
    await page.getByTestId("seatmap-trigger").click();
    await expect(page.locator(".yarl__portal")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator(".yarl__portal")).toHaveCount(0);
  });
});
