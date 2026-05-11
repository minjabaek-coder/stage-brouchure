import { expect, test } from "@playwright/test";

test.describe("S00 · 부트스트랩 smoke", () => {
  test("홈은 200 으로 응답하고 타이틀에 '어울림' 이 포함된다", async ({
    page,
  }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(/어울림/);
  });

  test("관리자 경로는 인증 없이 진입 가능 (placeholder 상태에서 200)", async ({
    page,
  }) => {
    // S10 까지는 /admin 라우트가 없으므로 404 가 정상.
    // 본 단계에서는 적어도 서버가 응답하는지 (5xx 가 아닌지) 만 확인.
    const response = await page.goto("/admin", { waitUntil: "domcontentloaded" });
    expect(response).not.toBeNull();
    expect(response!.status()).toBeLessThan(500);
  });

  test("robots.txt 가 /admin 을 disallow 한다", async ({ request }) => {
    const res = await request.get("/robots.txt");
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain("Disallow: /admin");
  });
});
