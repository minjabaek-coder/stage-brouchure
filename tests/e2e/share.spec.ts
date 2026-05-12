import { expect, test } from "@playwright/test";

test.describe("Share · FAB + 다이얼로그", () => {
  test("홈에 FAB 가 노출되고 클릭 시 다이얼로그가 열린다", async ({ page }) => {
    await page.goto("/");
    const fab = page.getByTestId("share-fab");
    await expect(fab).toBeVisible();

    await expect(page.getByTestId("share-dialog")).toBeHidden();
    await fab.click();
    await expect(page.getByTestId("share-dialog")).toBeVisible();
  });

  test("다이얼로그에 URL, QR, 복사 버튼이 모두 노출된다", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("share-fab").click();

    const url = page.getByTestId("share-url");
    await expect(url).toBeVisible();
    await expect(url).toContainText(/^https?:\/\//);

    await expect(page.getByTestId("share-qr")).toBeVisible();
    await expect(page.getByTestId("share-qr").locator("img")).toBeVisible();

    await expect(page.getByTestId("share-copy")).toBeVisible();
  });

  test("복사 버튼 클릭 시 클립보드에 site URL 이 들어가고 토스트가 노출된다", async ({
    page,
    context,
    browserName,
  }) => {
    // mobile-chromium 프로젝트에서는 권한 명세가 다를 수 있어 chromium 한정
    test.skip(
      browserName !== "chromium",
      "clipboard API 권한 부여는 chromium 에서만 검증",
    );

    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/");
    await page.getByTestId("share-fab").click();

    const expectedUrl = (await page
      .getByTestId("share-url")
      .textContent()) as string;
    await page.getByTestId("share-copy").click();

    await expect(page.getByText("주소를 복사했어요.")).toBeVisible();

    const clipboard = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboard).toBe(expectedUrl.trim());
  });

  test("닫기 버튼으로 다이얼로그가 닫힌다", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("share-fab").click();
    await expect(page.getByTestId("share-dialog")).toBeVisible();

    await page.getByTestId("share-dialog-close").click();
    await expect(page.getByTestId("share-dialog")).toBeHidden();
  });

  test("FAB 는 /search 와 /brochure 에도 노출되지만 /admin 에는 노출되지 않는다", async ({
    page,
  }) => {
    await page.goto("/search");
    await expect(page.getByTestId("share-fab")).toBeVisible();

    await page.goto("/brochure");
    await expect(page.getByTestId("share-fab")).toBeVisible();

    await page.goto("/admin");
    await expect(page.getByTestId("share-fab")).toHaveCount(0);
  });
});
