import { test } from "@playwright/test";
import path from "node:path";

const SCREENSHOT_DIR = path.join(process.cwd(), "tests", "screenshots");

test.describe("S00 시각 스냅샷 (페이지가 실제로 그려지는지 확인)", () => {
  test("홈", async ({ page }, testInfo) => {
    await page.goto("/");
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, `home-${testInfo.project.name}.png`),
      fullPage: true,
    });
  });

  test("admin (placeholder)", async ({ page }, testInfo) => {
    await page.goto("/admin");
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, `admin-${testInfo.project.name}.png`),
      fullPage: true,
    });
  });
});
