import { expect, test } from "@playwright/test";

const VIDEO_ID = "0aT4IdHXZW8";

test.describe("S03 · 초대 영상 인라인 재생 (FR-G02)", () => {
  test("첫 진입 시 썸네일 <img> 가 maxres URL 로 렌더된다", async ({
    page,
  }) => {
    await page.goto("/");
    const thumb = page.getByTestId("video-thumb-img");
    await expect(thumb).toBeVisible();
    const src = await thumb.getAttribute("src");
    expect(src).toContain(VIDEO_ID);
    expect(src).toContain("ytimg.com");
  });

  test("첫 진입 시 iframe 은 DOM 에 존재하지 않는다 (LCP 보호)", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator("iframe")).toHaveCount(0);
  });

  test("썸네일 클릭 → YouTube embed iframe 이 등장하고 playsinline=1 을 포함한다", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByTestId("video-thumb").click();

    const iframe = page.locator(`iframe[src*="youtube.com/embed/${VIDEO_ID}"]`);
    await expect(iframe).toBeVisible();

    const src = await iframe.getAttribute("src");
    expect(src).toContain("playsinline=1");
    expect(src).toContain("autoplay=1");

    // 썸네일 버튼은 사라져야 함
    await expect(page.getByTestId("video-thumb")).toHaveCount(0);
  });

  test("iframe allow 속성에 autoplay/picture-in-picture 가 포함된다", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByTestId("video-thumb").click();
    const allow = await page
      .locator("iframe")
      .first()
      .getAttribute("allow");
    expect(allow).toContain("autoplay");
    expect(allow).toContain("picture-in-picture");
  });
});
