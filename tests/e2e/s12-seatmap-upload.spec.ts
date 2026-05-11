import { expect, test } from "@playwright/test";
import sharp from "sharp";

// Admin = desktop-only + serial (S11 과 동일 사유: DB 변경 격리)
test.describe.configure({ mode: "serial" });
test.beforeEach(async ({}, info) => {
  test.skip(
    info.project.name === "mobile-chromium",
    "admin UI is desktop-only",
  );
});

async function generateJpeg(width: number, height: number): Promise<Buffer> {
  return sharp({
    create: {
      width,
      height,
      channels: 3,
      background: { r: 92, g: 26, b: 27 }, // burgundy
    },
  })
    .jpeg({ quality: 80 })
    .toBuffer();
}

test.describe("S12 · 관리자 좌석배치도 업로드 (FR-A03)", () => {
  test("/admin → 좌석맵 섹션 dropzone + 현재 미리보기 노출", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.getByTestId("admin-seatmap-section")).toBeVisible();
    await expect(page.getByTestId("seatmap-dropzone")).toBeVisible();
    // 시드된 placeholder 가 미리보기로 노출
    await expect(page.getByTestId("seatmap-current-img")).toBeVisible();
  });

  test("새 이미지 업로드 → 미리보기 갱신 + /search 의 좌석맵 src 변경", async ({
    page,
  }) => {
    await page.goto("/admin");
    const before = await page
      .getByTestId("seatmap-current-img")
      .getAttribute("src");

    const buf = await generateJpeg(2000, 1500);
    const responsePromise = page.waitForResponse((res) =>
      res.url().endsWith("/api/admin/upload-seatmap"),
    );
    await page
      .getByTestId("seatmap-dropzone")
      .locator('input[type="file"]')
      .setInputFiles({
      name: "seatmap-new.jpg",
      mimeType: "image/jpeg",
      buffer: buf,
    });
    const res = await responsePromise;
    expect(res.status()).toBe(200);

    // 미리보기 src 변경 (캐시버스터 v={ts} 다름)
    const after = await page
      .getByTestId("seatmap-current-img")
      .getAttribute("src");
    expect(after).not.toBe(before);
    expect(after).toMatch(/^\/uploads\/seatmap\.jpg\?v=\d+$/);

    // /search 도 갱신 — revalidatePath 가 동작한 결과로 새 URL 노출
    // next/image 는 src 를 /_next/image?url=...&w=...&q=75 로 프록시하므로
    // url 쿼리 파라미터 안에서 originally URL-encoded 경로를 검증한다.
    await page.goto("/search");
    const seatmapImg = page.getByTestId("seatmap-img");
    const searchSrc = await seatmapImg.getAttribute("src");
    expect(searchSrc).toMatch(/uploads%2Fseatmap\.jpg/);
  });

  test("6MB 이미지 업로드 시도 → 5MB 초과로 거부", async ({ page }) => {
    await page.goto("/admin");
    const big = Buffer.alloc(6_300_000, 0xff);
    await page
      .getByTestId("seatmap-dropzone")
      .locator('input[type="file"]')
      .setInputFiles({
      name: "huge.jpg",
      mimeType: "image/jpeg",
      buffer: big,
    });
    await expect(page.locator("body")).toContainText(/5MB 를 초과합니다/, {
      timeout: 5000,
    });
  });

  test("PDF 등 비-이미지 → 415 거부 (서버 가드)", async ({ page }) => {
    await page.goto("/admin");
    // PDF 매직 바이트
    const fakePdf = Buffer.from("%PDF-1.4\n");
    const responsePromise = page.waitForResponse((res) =>
      res.url().endsWith("/api/admin/upload-seatmap"),
    );
    await page
      .getByTestId("seatmap-dropzone")
      .locator('input[type="file"]')
      .setInputFiles({
      name: "doc.pdf",
      mimeType: "application/pdf",
      buffer: fakePdf,
    });
    const res = await responsePromise;
    expect(res.status()).toBe(415);
  });
});
