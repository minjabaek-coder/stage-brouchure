import { expect, test } from "@playwright/test";

const SEARCH_URL = "/api/search";

/**
 * Each test uses its own X-Forwarded-For so rate-limit buckets don't bleed
 * across tests. The project suffix (mobile/desktop) keeps mobile-chromium and
 * desktop-chromium runs from sharing the same in-memory bucket on the single
 * Next.js process that Playwright spawns.
 */
function ipHeaders(ip: string, project: string) {
  return { "x-forwarded-for": `${ip}-${project}` };
}

test.describe("S06 · 검색 API + Rate Limit (FR-G03, FR-G05)", () => {
  test("시드된 이름 + 전화 → 200 + 좌석 정보", async ({ request }, info) => {
    const res = await request.post(SEARCH_URL, {
      data: { name: "신귀복", phone_last4: "0001" },
      headers: ipHeaders("10.0.0.1", info.project.name),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.data).toMatchObject({
      name: "신귀복",
      seat: "A-1",
      phoneLast4: "0001",
    });
  });

  test("phone_last4 누락 → 400 INVALID_INPUT", async ({ request }, info) => {
    const res = await request.post(SEARCH_URL, {
      data: { name: "신귀복" },
      headers: ipHeaders("10.0.0.2", info.project.name),
    });
    expect(res.status()).toBe(400);
    expect(await res.json()).toEqual({ error: { code: "INVALID_INPUT" } });
  });

  test("phone_last4 형식 불일치 (5자리) → 400", async ({ request }, info) => {
    const res = await request.post(SEARCH_URL, {
      data: { name: "신귀복", phone_last4: "12345" },
      headers: ipHeaders("10.0.0.3", info.project.name),
    });
    expect(res.status()).toBe(400);
  });

  test("이름은 시드 + 전화는 미일치 → 404 NOT_FOUND", async ({
    request,
  }, info) => {
    const res = await request.post(SEARCH_URL, {
      data: { name: "신귀복", phone_last4: "9999" },
      headers: ipHeaders("10.0.0.4", info.project.name),
    });
    expect(res.status()).toBe(404);
    expect(await res.json()).toEqual({ error: { code: "NOT_FOUND" } });
  });

  test("이름·전화 모두 미일치 → 404 NOT_FOUND (이름 미존재 누설 금지, PRD §2.2.5)", async ({
    request,
  }, info) => {
    const res = await request.post(SEARCH_URL, {
      data: { name: "존재하지않는이름", phone_last4: "0001" },
      headers: ipHeaders("10.0.0.5", info.project.name),
    });
    expect(res.status()).toBe(404);
    expect(await res.json()).toEqual({ error: { code: "NOT_FOUND" } });
  });

  test("동일 IP 31회 연속 → 마지막은 429 RATE_LIMITED", async ({
    request,
  }, info) => {
    const headers = ipHeaders("10.0.99.99", info.project.name);

    // 첫 30회는 통과 (200/404 어느 쪽이든 success: true 로 카운트)
    for (let i = 0; i < 30; i++) {
      const res = await request.post(SEARCH_URL, {
        data: { name: "신귀복", phone_last4: "0001" },
        headers,
      });
      expect(res.status(), `attempt ${i + 1}`).not.toBe(429);
    }

    // 31번째는 차단
    const blocked = await request.post(SEARCH_URL, {
      data: { name: "신귀복", phone_last4: "0001" },
      headers,
    });
    expect(blocked.status()).toBe(429);
    expect(await blocked.json()).toEqual({ error: { code: "RATE_LIMITED" } });
  });
});
