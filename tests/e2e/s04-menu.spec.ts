import { expect, test } from "@playwright/test";

test.describe("S04 · 홈 메뉴 카드 + 라우트 스텁 (FR-G07) — 라이트 테마", () => {
  test("홈에 두 메뉴 카드가 노출된다 (자리 찾기 / 공연 안내서)", async ({
    page,
  }) => {
    await page.goto("/");
    const search = page.getByTestId("menu-card-search");
    const brochure = page.getByTestId("menu-card-brochure");
    await expect(search).toBeVisible();
    await expect(brochure).toBeVisible();
    await expect(search).toContainText("자리 찾기");
    await expect(search).toContainText("예매하신 좌석을 확인하세요");
    await expect(brochure).toContainText("공연 안내서");
    await expect(brochure).toContainText("프로그램과 출연진을 만나보세요");
  });

  test("자리 찾기 카드 → /search 이동, Chapter I + 자리 찾기 헤더 노출", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByTestId("menu-card-search").click();
    await expect(page).toHaveURL(/\/search$/);
    const header = page.getByTestId("page-header");
    await expect(header).toContainText("Chapter I");
    await expect(header).toContainText("자리 찾기");
  });

  test("뒤로 가기 버튼 클릭 → 홈 (/) 로 복귀", async ({ page }) => {
    await page.goto("/search");
    await page.getByTestId("back-button").click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByTestId("menu-card-list")).toBeVisible();
  });

  test("브로셔 카드 → /brochure 이동, Chapter II + 공연 안내서 헤더 노출", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByTestId("menu-card-brochure").click();
    await expect(page).toHaveURL(/\/brochure$/);
    const header = page.getByTestId("page-header");
    await expect(header).toContainText("Chapter II");
    await expect(header).toContainText("공연 안내서");
  });

  test("브라우저 뒤로 가기로도 홈 복귀", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("menu-card-search").click();
    await expect(page).toHaveURL(/\/search$/);
    await page.goBack();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByTestId("menu-card-list")).toBeVisible();
  });
});
