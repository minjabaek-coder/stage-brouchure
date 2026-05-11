import { expect, test } from "@playwright/test";

test.describe("S10 · 관리자 페이지 셸 (FR-A01)", () => {
  test("/admin 진입 시 200 + '관리자 페이지' 헤더가 노출된다", async ({
    page,
  }) => {
    const res = await page.goto("/admin");
    expect(res?.status()).toBe(200);
    const header = page.getByTestId("admin-header");
    await expect(header).toContainText("관리자 페이지");
  });

  test("상단 status bar 에 '현재 등록: N명' 이 노출된다 (시드 후 22)", async ({
    page,
  }) => {
    await page.goto("/admin");
    const cell = page.getByTestId("status-attendees");
    await expect(cell).toContainText(/현재 등록: \d+명/);
    // 글로벌 setup 의 시드 결과
    await expect(cell).toContainText("현재 등록: 22명");
  });

  test("3 섹션이 모두 노출된다 (S11/12/13 이후 모두 실제 마운트)", async ({
    page,
  }) => {
    await page.goto("/admin");

    // CSV 섹션 (S11) — dropzone 노출
    const csv = page.getByTestId("admin-csv-section");
    await expect(csv).toContainText("명단 (CSV)");
    await expect(page.getByTestId("csv-dropzone")).toBeVisible();

    // 좌석배치도 섹션 (S12) — 현재 미리보기 + dropzone
    const seatmap = page.getByTestId("admin-seatmap-section");
    await expect(seatmap).toContainText("좌석배치도");
    await expect(page.getByTestId("seatmap-dropzone")).toBeVisible();

    // 브로셔 섹션 (S13) — 8 슬롯 그리드 + 일괄 업로드 트리거
    const brochure = page.getByTestId("admin-brochure-section");
    await expect(brochure).toContainText("브로셔 (8장)");
    await expect(page.getByTestId("brochure-slot-grid")).toBeVisible();
    await expect(page.getByTestId("brochure-bulk-trigger")).toBeVisible();
  });

  test("status bar 가 seat map / brochure 마지막 업로드 시간을 표시한다", async ({
    page,
  }) => {
    await page.goto("/admin");
    // 시드 직후라 두 항목 모두 timestamp 가 있어야 함 (— 가 아님)
    const seatmapTime = page.getByTestId("status-seatmap-time");
    const brochureTime = page.getByTestId("status-brochure-time");
    await expect(seatmapTime).not.toHaveText("—");
    await expect(brochureTime).not.toHaveText("—");
    // CSV 업로드 이력은 아직 없으므로 placeholder
    await expect(page.getByTestId("status-csv-time")).toHaveText("—");
  });

  test("robots.txt 가 여전히 /admin 을 disallow 한다 (S00 회귀)", async ({
    request,
  }) => {
    const res = await request.get("/robots.txt");
    expect(res.status()).toBe(200);
    expect(await res.text()).toContain("Disallow: /admin");
  });
});
