import { expect, test } from "@playwright/test";
import sharp from "sharp";

test.describe.configure({ mode: "serial" });
test.beforeEach(async ({}, info) => {
  test.skip(
    info.project.name === "mobile-chromium",
    "admin UI is desktop-only",
  );
});

async function jpegBuffer(
  width: number,
  height: number,
  rgb: { r: number; g: number; b: number },
): Promise<Buffer> {
  return sharp({
    create: { width, height, channels: 3, background: rgb },
  })
    .jpeg({ quality: 80 })
    .toBuffer();
}

/** Build 8 distinct JPEGs that the server will sharp-optimize. */
async function eightFiles() {
  const colors = [
    { r: 80, g: 60, b: 40 },
    { r: 100, g: 70, b: 40 },
    { r: 120, g: 80, b: 40 },
    { r: 140, g: 90, b: 40 },
    { r: 160, g: 100, b: 40 },
    { r: 180, g: 110, b: 40 },
    { r: 200, g: 120, b: 40 },
    { r: 220, g: 130, b: 40 },
  ];
  const out: { name: string; mimeType: string; buffer: Buffer }[] = [];
  for (let i = 0; i < 8; i++) {
    const padded = String(i + 1).padStart(2, "0");
    out.push({
      name: `brochure-${padded}.jpg`,
      mimeType: "image/jpeg",
      buffer: await jpegBuffer(800, 1100, colors[i]!),
    });
  }
  return out;
}

test.describe("S13 · 관리자 브로셔 업로드 (FR-A04)", () => {
  test("/admin → 브로셔 섹션에 8 슬롯이 노출된다", async ({ page }) => {
    await page.goto("/admin");
    const grid = page.getByTestId("brochure-slot-grid");
    await expect(grid).toBeVisible();
    for (let i = 1; i <= 8; i++) {
      const padded = String(i).padStart(2, "0");
      await expect(page.getByTestId(`brochure-slot-${padded}`)).toBeVisible();
      // 시드된 placeholder SVG 가 미리보기로 노출됨
      await expect(
        page.getByTestId(`brochure-slot-img-${padded}`),
      ).toBeVisible();
    }
  });

  test("8장 일괄 업로드 → 8 슬롯 미리보기 갱신 + /brochure 반영", async ({
    page,
  }) => {
    await page.goto("/admin");
    const files = await eightFiles();

    const responsePromise = page.waitForResponse((r) =>
      r.url().endsWith("/api/admin/upload-brochure"),
    );
    await page.getByTestId("brochure-bulk-input").setInputFiles(files);
    const res = await responsePromise;
    expect(res.status()).toBe(200);
    const body = (await res.json()) as {
      updated: { slot: number; url: string }[];
    };
    expect(body.updated).toHaveLength(8);
    expect(body.updated.map((u) => u.slot).sort((a, b) => a - b)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8,
    ]);

    // 첫 슬롯의 src 가 새 /uploads/brochure-01.jpg 로 바뀌었는지 확인
    await expect(page.getByTestId("brochure-slot-img-01")).toHaveAttribute(
      "src",
      /\/uploads\/brochure-01\.jpg\?v=\d+/,
    );

    // /brochure 페이지에서도 같은 8장 노출
    await page.goto("/brochure");
    for (let i = 1; i <= 8; i++) {
      const padded = String(i).padStart(2, "0");
      const img = page.getByTestId(`brochure-img-${padded}`);
      const src = await img.getAttribute("src");
      expect(src).toMatch(new RegExp(`brochure-${padded}\\.jpg`));
    }
  });

  test("슬롯 3 단일 교체 → /brochure 의 3번째만 변경, 나머지 동일", async ({
    page,
  }) => {
    await page.goto("/admin");

    const beforeSrcs: string[] = [];
    for (let i = 1; i <= 8; i++) {
      const padded = String(i).padStart(2, "0");
      const src = await page
        .getByTestId(`brochure-slot-img-${padded}`)
        .getAttribute("src");
      beforeSrcs.push(src ?? "");
    }

    const newPage3 = await jpegBuffer(800, 1100, { r: 50, g: 50, b: 50 });
    const responsePromise = page.waitForResponse((r) =>
      r.url().endsWith("/api/admin/upload-brochure"),
    );
    await page.getByTestId("brochure-slot-input-03").setInputFiles({
      name: "page-3-replacement.jpg",
      mimeType: "image/jpeg",
      buffer: newPage3,
    });
    const res = await responsePromise;
    expect(res.status()).toBe(200);
    const body = (await res.json()) as {
      updated: { slot: number; url: string }[];
    };
    expect(body.updated).toEqual([
      expect.objectContaining({ slot: 3 }),
    ]);

    // 슬롯 3 src 가 변경
    const after3 = await page
      .getByTestId("brochure-slot-img-03")
      .getAttribute("src");
    expect(after3).not.toBe(beforeSrcs[2]);
    // 다른 슬롯들은 그대로
    for (const idx of [1, 2, 4, 5, 6, 7, 8]) {
      const padded = String(idx).padStart(2, "0");
      const after = await page
        .getByTestId(`brochure-slot-img-${padded}`)
        .getAttribute("src");
      expect(after, `slot ${padded}`).toBe(beforeSrcs[idx - 1]);
    }
  });

  test("9장 업로드 시도 → 클라이언트 검증으로 거부", async ({ page }) => {
    await page.goto("/admin");
    const eight = await eightFiles();
    const ninth = {
      name: "brochure-09.jpg",
      mimeType: "image/jpeg",
      buffer: await jpegBuffer(400, 550, { r: 0, g: 100, b: 100 }),
    };
    await page
      .getByTestId("brochure-bulk-input")
      .setInputFiles([...eight, ninth]);

    await expect(page.locator("body")).toContainText(
      /최대 8장까지 업로드할 수 있습니다/,
      { timeout: 5000 },
    );
  });
});
