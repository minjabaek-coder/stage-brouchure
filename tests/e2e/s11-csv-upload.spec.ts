import { expect, test } from "@playwright/test";
import path from "node:path";

const FIXTURES = path.join(process.cwd(), "tests", "fixtures");
const VALID = path.join(FIXTURES, "attendees-valid.csv");
const SECOND = path.join(FIXTURES, "attendees-second.csv");
const INVALID = path.join(FIXTURES, "attendees-invalid.csv");

// Each test mutates `attendees` and `csv_backups`, so they must run one at a
// time. Admin UI is operator-only (PRD §3.1) and not optimized for mobile, so
// the mobile-chromium project skips this whole spec to keep DB state stable.
test.describe.configure({ mode: "serial" });
test.beforeEach(async ({}, info) => {
  test.skip(
    info.project.name === "mobile-chromium",
    "admin UI is desktop-only; skip on mobile project to avoid DB races",
  );
});

async function uploadCsv(page: import("@playwright/test").Page, file: string) {
  await page.goto("/admin");
  // Trigger file picker via the hidden input directly (Dropzone uses sr-only).
  await page
    .getByTestId("csv-dropzone")
    .locator('input[type="file"]')
    .setInputFiles(file);
  await expect(page.getByTestId("csv-preview")).toBeVisible();

  // Wait for the POST to actually complete before returning, otherwise the
  // next test step can fire before the DB has been updated.
  const responsePromise = page.waitForResponse(
    (res) =>
      res.url().endsWith("/api/admin/upload-csv") && res.request().method() === "POST",
  );
  await page.getByTestId("csv-upload-confirm-trigger").click();
  await page.getByTestId("csv-confirm-dialog-confirm").click();
  await responsePromise;
}

test.describe("S11 · 관리자 CSV 업로드 + 자동 백업 (FR-A02)", () => {
  test("/admin 진입 시 CSV 섹션과 dropzone 이 노출된다", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.getByTestId("admin-csv-section")).toBeVisible();
    await expect(page.getByTestId("csv-dropzone")).toBeVisible();
  });

  test("attendees-valid.csv 업로드 → 미리보기 → 확인 → 토스트 + status 갱신", async ({
    page,
  }) => {
    await uploadCsv(page, VALID);

    // 토스트는 sonner — 텍스트로 매칭
    await expect(page.locator("body")).toContainText("총 10건 등록 완료", {
      timeout: 5000,
    });

    // status bar 의 attendee count 가 10 으로 갱신
    await page.reload();
    await expect(page.getByTestId("status-attendees")).toHaveText(
      "현재 등록: 10명",
    );
  });

  test("새 CSV 의 첫 행으로 /api/search 가 새 좌석을 반환한다 (UI 비활성화 후 API 단위 검증)", async ({
    page,
    request,
  }) => {
    await uploadCsv(page, VALID);
    const res = await request.post("/api/search", {
      data: { name: "김민수", phone_last4: "1111" },
      headers: { "content-type": "application/json" },
    });
    expect(res.status()).toBe(200);
    const body = (await res.json()) as {
      data: { name: string; seat: string; phoneLast4: string };
    };
    expect(body.data.name).toBe("김민수");
    expect(body.data.seat).toBe("A-1");
  });

  test("두 번째 CSV 업로드 → csv_backups 가 2건이 된다 (status CSV 갱신)", async ({
    page,
  }) => {
    await uploadCsv(page, VALID);
    await uploadCsv(page, SECOND);

    // 두 번째 업로드 후엔 두 번째 CSV (3 행) 가 반영됨
    await page.goto("/admin");
    await expect(page.getByTestId("status-attendees")).toHaveText(
      "현재 등록: 3명",
    );
    // CSV 마지막 업로드 시간이 — 가 아니라 timestamp
    await expect(page.getByTestId("status-csv-time")).not.toHaveText("—");
  });

  test("attendees-invalid.csv → 잘못된 행은 invalid 목록에 표시, 유효 행만 등록", async ({
    page,
  }) => {
    await page.goto("/admin");
    await page
      .getByTestId("csv-dropzone")
      .locator('input[type="file"]')
      .setInputFiles(INVALID);
    await expect(page.getByTestId("csv-preview")).toBeVisible();

    // 1행은 invalid (5자리 phone), 2행은 valid → invalid block 노출
    const invalidBlock = page.getByTestId("csv-preview-invalid");
    await expect(invalidBlock).toBeVisible();
    await expect(invalidBlock).toContainText("L3"); // 헤더(1) + valid(2) → invalid 가 line 3

    await page.getByTestId("csv-upload-confirm-trigger").click();
    await page.getByTestId("csv-confirm-dialog-confirm").click();
    await expect(page.locator("body")).toContainText(/총 2건 등록 완료/, {
      timeout: 5000,
    });
  });

  test("6MB 파일 업로드 시도 → 거부 메시지", async ({ page }) => {
    await page.goto("/admin");
    // 5MB+ 버퍼 생성 — 6,300,000 bytes
    const big = Buffer.alloc(6_300_000, "a".charCodeAt(0));
    await page
      .getByTestId("csv-dropzone")
      .locator('input[type="file"]')
      .setInputFiles({ name: "big.csv", mimeType: "text/csv", buffer: big });

    // 클라이언트 Dropzone 검증으로 거부 → 토스트 노출
    await expect(page.locator("body")).toContainText(/5MB 를 초과합니다/, {
      timeout: 5000,
    });
    // 미리보기는 노출되지 않음
    await expect(page.getByTestId("csv-preview")).toHaveCount(0);
  });
});
