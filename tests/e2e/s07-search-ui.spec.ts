import { expect, test } from "@playwright/test";

test.describe("S07 · 자리 찾기 UI (FR-G03)", () => {
  test("/search 진입 시 폼이 노출된다 (이름 + 전화 + CTA)", async ({ page }) => {
    await page.goto("/search");
    await expect(page.getByTestId("search-form")).toBeVisible();
    await expect(page.locator("#search-name")).toBeVisible();
    await expect(page.locator("#search-phone")).toBeVisible();
    await expect(page.getByTestId("search-submit")).toBeVisible();
  });

  test("이름만 입력하고 제출 → 클라이언트 검증 메시지", async ({ page }) => {
    await page.goto("/search");
    await page.locator("#search-name").fill("신귀복");
    await page.getByTestId("search-submit").click();
    const validation = page.getByTestId("search-validation");
    await expect(validation).toBeVisible();
    await expect(validation).toContainText("이름과 전화번호 뒷자리 4자리");
    // 결과 카드는 표시되지 않음
    await expect(page.getByTestId("seat-result-card")).toHaveCount(0);
    await expect(page.getByTestId("no-result-card")).toHaveCount(0);
  });

  test("신귀복 + 0001 → 결과 카드: 이름 / ****-****-0001 / A-1", async ({
    page,
  }) => {
    await page.goto("/search");
    await page.locator("#search-name").fill("신귀복");
    await page.locator("#search-phone").fill("0001");
    await page.getByTestId("search-submit").click();

    const card = page.getByTestId("seat-result-card");
    await expect(card).toBeVisible();
    await expect(page.getByTestId("result-name")).toHaveText("신귀복 님");
    await expect(page.getByTestId("result-seat")).toHaveText("A-1");
    await expect(page.getByTestId("result-phone-mask")).toHaveText(
      "****-****-0001",
    );
  });

  test("신귀복 + 9999 → '일치하는 정보를 찾을 수 없습니다' 카드", async ({
    page,
  }) => {
    await page.goto("/search");
    await page.locator("#search-name").fill("신귀복");
    await page.locator("#search-phone").fill("9999");
    await page.getByTestId("search-submit").click();

    const noResult = page.getByTestId("no-result-card");
    await expect(noResult).toBeVisible();
    await expect(noResult).toContainText("일치하는 정보를 찾을 수 없습니다");
    await expect(page.getByTestId("seat-result-card")).toHaveCount(0);
  });

  test("결과 카드 표시 후 두 입력을 모두 비우면 카드가 사라진다", async ({
    page,
  }) => {
    await page.goto("/search");
    await page.locator("#search-name").fill("신귀복");
    await page.locator("#search-phone").fill("0001");
    await page.getByTestId("search-submit").click();
    await expect(page.getByTestId("seat-result-card")).toBeVisible();

    await page.locator("#search-name").fill("");
    await page.locator("#search-phone").fill("");

    await expect(page.getByTestId("seat-result-card")).toHaveCount(0);
    await expect(page.getByTestId("no-result-card")).toHaveCount(0);
    await expect(page.getByTestId("search-validation")).toHaveCount(0);
  });

  test("전화 입력은 숫자만 받고 4자리로 잘린다", async ({ page }) => {
    await page.goto("/search");
    const phone = page.locator("#search-phone");
    await phone.fill("abc12345");
    await expect(phone).toHaveValue("1234");
  });
});
