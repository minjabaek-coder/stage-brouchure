import { expect, test } from "@playwright/test";

test.describe("S05 · DB 스키마 + 시드 (ENT-01/02/03)", () => {
  test("/api/__test__/seed-check 가 시드된 attendees 수 + video ID 를 반환한다", async ({
    request,
  }) => {
    const res = await request.get("/api/dev/seed-check");
    expect(res.status()).toBe(200);
    const body = await res.json();
    // HTML lines 1324-1347 의 더미 게스트는 22명 (docs 의 23 표기는 오류)
    expect(body.attendees).toBe(22);
    expect(body.videoId).toBe("0aT4IdHXZW8");
  });
});
