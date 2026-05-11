import { expect, test } from "@playwright/test";

test.describe("S04 · 홈 메뉴 카드 + 라우트 스텁 (FR-G07)", () => {
  test("홈에 두 메뉴 카드가 노출된다 (자리 찾기 / 브로셔)", async ({ page }) => {
    await page.goto("/");
    const cards = page.getByTestId("menu-card");
    await expect(cards).toHaveCount(2);
    await expect(cards.nth(0)).toContainText("자리 찾기");
    await expect(cards.nth(0)).toContainText("Find Your Seat");
    await expect(cards.nth(1)).toContainText("브로셔");
    await expect(cards.nth(1)).toContainText("Programme & Notes");
  });

  test("자리 찾기 카드 → /search 이동, Chapter I + 자리 찾기 헤더 노출", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByTestId("menu-card").nth(0).click();
    await expect(page).toHaveURL(/\/search$/);
    const header = page.getByTestId("page-header");
    await expect(header).toContainText("Chapter I");
    await expect(header).toContainText("자리 찾기");
  });

  test("뒤로 가기 버튼 클릭 → 홈 (/) 로 복귀", async ({ page }) => {
    await page.goto("/search");
    await page.getByTestId("back-button").click();
    await expect(page).toHaveURL(/\/$/);
    // 홈에 메뉴 카드가 다시 노출되는지 확인
    await expect(page.getByTestId("menu-card-list")).toBeVisible();
  });

  test("브로셔 카드 → /brochure 이동, Chapter II + 브로셔 헤더 노출", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByTestId("menu-card").nth(1).click();
    await expect(page).toHaveURL(/\/brochure$/);
    const header = page.getByTestId("page-header");
    await expect(header).toContainText("Chapter II");
    await expect(header).toContainText("브로셔");
  });

  test("브라우저 뒤로 가기로도 홈 복귀", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("menu-card").nth(0).click();
    await expect(page).toHaveURL(/\/search$/);
    await page.goBack();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByTestId("menu-card-list")).toBeVisible();
  });
});
