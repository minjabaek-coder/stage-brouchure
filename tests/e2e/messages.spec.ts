import { expect, test } from "@playwright/test";

// Each test creates rows in `messages`; running in parallel would race.
// Use distinct X-Forwarded-For values per test to avoid hitting the 1/min
// Rate Limit on later steps.
test.describe.configure({ mode: "serial" });

test.describe("방명록 (공개)", () => {
  test("홈에 방명록 미리보기 섹션이 노출된다", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("messages-preview")).toBeVisible();
    await expect(page.getByTestId("message-form-button")).toBeVisible();
    await expect(page.getByTestId("messages-see-all")).toHaveAttribute(
      "href",
      "/messages",
    );
  });

  test("작성 버튼 클릭 시 모달이 열리고 닫을 수 있다", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("message-form-button").first().click();
    await expect(page.getByTestId("message-dialog")).toBeVisible();
    await page.getByTestId("message-dialog-close").click();
    await expect(page.getByTestId("message-dialog")).toBeHidden();
  });

  test("API POST 로 작성한 메시지가 홈 미리보기와 /messages 에 노출된다", async ({
    page,
    request,
  }) => {
    const res = await request.post("/api/messages", {
      data: { nickname: "테스터A", body: "공연 너무 기대돼요!" },
      headers: {
        "X-Forwarded-For": "10.0.0.1",
        "X-Ratelimit-Bypass": "test",
      },
    });
    expect(res.status()).toBe(200);
    const body = (await res.json()) as { data: { id: string; body: string } };
    expect(body.data.body).toBe("공연 너무 기대돼요!");

    await page.goto("/");
    await expect(page.getByTestId("messages-preview-list")).toContainText(
      "공연 너무 기대돼요!",
    );
    await expect(page.getByTestId("messages-preview-list")).toContainText(
      "테스터A",
    );

    await page.goto("/messages");
    await expect(page.getByTestId("messages-list")).toContainText(
      "공연 너무 기대돼요!",
    );
  });

  test("rate limit: 같은 IP 에서 1분 내 두 번째 POST 는 429", async ({
    request,
  }, info) => {
    // 같은 IP 를 두 프로젝트 (mobile/desktop) 에서 공유하면 첫 호출부터 429.
    // 프로젝트별로 octet 분기해 격리한다.
    const ip =
      info.project.name === "mobile-chromium" ? "10.0.10.2" : "10.0.20.2";
    const first = await request.post("/api/messages", {
      data: { nickname: "도배1", body: "첫 번째 메시지" },
      headers: { "X-Forwarded-For": ip },
    });
    expect(first.status()).toBe(200);

    const second = await request.post("/api/messages", {
      data: { nickname: "도배2", body: "두 번째 메시지" },
      headers: { "X-Forwarded-For": ip },
    });
    expect(second.status()).toBe(429);
  });

  test("닉네임 1자 등 invalid input → 400", async ({ request }) => {
    const res = await request.post("/api/messages", {
      data: { nickname: "X", body: "valid body" },
      headers: {
        "X-Forwarded-For": "10.0.0.3",
        "X-Ratelimit-Bypass": "test",
      },
    });
    expect(res.status()).toBe(400);

    const long = await request.post("/api/messages", {
      data: { nickname: "정상닉", body: "a".repeat(201) },
      headers: {
        "X-Forwarded-For": "10.0.0.6",
        "X-Ratelimit-Bypass": "test",
      },
    });
    expect(long.status()).toBe(400);
  });

  test("UI 폼 제출 → 토스트 + 새 메시지가 미리보기에 노출", async ({
    browser,
  }) => {
    // 새 IP + rate limit 우회 헤더로 컨텍스트 생성
    const context = await browser.newContext({
      extraHTTPHeaders: {
        "X-Forwarded-For": "10.0.0.4",
        "X-Ratelimit-Bypass": "test",
      },
    });
    const page = await context.newPage();

    const uniqueBody = `UI 로 작성한 메시지 ${Date.now()}`;
    await page.goto("/");
    await page.getByTestId("message-form-button").first().click();
    await page.getByTestId("message-input-nickname").fill("폼테스터");
    await page.getByTestId("message-input-body").fill(uniqueBody);
    await page.getByTestId("message-submit").click();

    // sonner toast — 다이얼로그가 닫히면 토스트만 남음
    await expect(page.getByTestId("message-dialog")).toBeHidden();
    await expect(page.getByTestId("messages-preview-list")).toContainText(
      uniqueBody,
    );
    await context.close();
  });
});

test.describe("방명록 관리자", () => {
  test.beforeEach(async ({}, info) => {
    test.skip(
      info.project.name === "mobile-chromium",
      "admin UI는 운영자(데스크톱) 전용 — 모바일 프로젝트는 건너뜀",
    );
  });

  test("/admin 상단 nav 에 두 탭이 노출된다", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.getByTestId("admin-nav")).toBeVisible();
    await expect(page.getByTestId("admin-nav-content")).toBeVisible();
    await expect(page.getByTestId("admin-nav-messages")).toBeVisible();
  });

  test("/admin/messages 에 헤더, 총 개수, 목록이 노출된다", async ({ page }) => {
    await page.goto("/admin/messages");
    await expect(page.getByTestId("admin-messages-header")).toBeVisible();
    await expect(page.getByTestId("admin-messages-total")).toBeVisible();
    await expect(page.getByTestId("admin-nav-messages")).toBeVisible();
  });

  test("/admin/messages 에서 삭제 → 목록에서 사라진다", async ({
    page,
    request,
  }) => {
    const unique = `del-${Date.now()}`;
    const created = await request.post("/api/messages", {
      data: { nickname: "삭제대상", body: unique },
      headers: { "X-Forwarded-For": "10.0.0.5" },
    });
    expect(created.status()).toBe(200);

    await page.goto("/admin/messages");
    const target = page.locator('[data-testid="admin-message-item"]', {
      hasText: unique,
    });
    await expect(target).toBeVisible();

    const deleteRes = page.waitForResponse(
      (r) =>
        r.url().includes("/api/admin/messages/") &&
        r.request().method() === "DELETE",
    );
    await target.getByTestId("admin-message-delete").click();
    await page.getByTestId("admin-message-confirm-confirm").click();
    await deleteRes;

    await expect(page.getByText(unique)).toBeHidden();
  });
});
