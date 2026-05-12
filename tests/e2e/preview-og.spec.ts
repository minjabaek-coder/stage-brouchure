import { createServer, type Server } from "node:http";
import { AddressInfo } from "node:net";
import { expect, test, type Page } from "@playwright/test";

/**
 * dev-preview: 공연장 지도 URL OG 스크래핑 e2e.
 *
 * Next.js 서버 측 fetch 를 가로채야 하므로 Playwright 의 page.route 가 아닌
 * 별도 로컬 HTTP 서버 (port 0 자동 할당) 를 띄워 mock 페이지/이미지를 제공한다.
 */

test.describe.configure({ mode: "serial" });
test.beforeEach(async ({}, info) => {
  test.skip(
    info.project.name === "mobile-chromium",
    "admin UI is desktop-only",
  );
});

// 8x8 짜리 파란색 PNG — sharp 가 재압축할 거라 크기/해상도는 중요하지 않음.
const PNG_64 =
  "iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAACXBIWXMAAAPoAAAD6AG1e1JrAAAAO0lEQVR4nGMIqDhBU8QwakHFaBCdGE1FAaMZ7cRoUREwWppWjFY4AaNVZsVoq+LEaMOrYrTpeGJQt64BZHxAWypc59oAAAAASUVORK5CYII=";
const PNG = Buffer.from(PNG_64, "base64");

interface Mock {
  url: string;
  imageUrl: string;
  close(): Promise<void>;
  setWithOg(b: boolean): void;
}

async function startMock(): Promise<Mock> {
  let withOg = true;
  const server: Server = createServer((req, res) => {
    if (req.url === "/venue") {
      const og = withOg
        ? `<meta property="og:image" content="http://${req.headers.host}/og.png">`
        : "";
      const html = `<!doctype html><html><head><title>mock</title>${og}</head><body>ok</body></html>`;
      res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      res.end(html);
      return;
    }
    if (req.url === "/og.png") {
      res.writeHead(200, { "content-type": "image/png" });
      res.end(PNG);
      return;
    }
    res.writeHead(404);
    res.end();
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const port = (server.address() as AddressInfo).port;
  return {
    url: `http://127.0.0.1:${port}/venue`,
    imageUrl: `http://127.0.0.1:${port}/og.png`,
    setWithOg: (b) => {
      withOg = b;
    },
    async close() {
      await new Promise<void>((resolve, reject) =>
        server.close((e) => (e ? reject(e) : resolve())),
      );
    },
  };
}

let mock: Mock;
test.beforeAll(async () => {
  mock = await startMock();
});
test.afterAll(async () => {
  await mock?.close();
});

async function saveVenue(page: Page, mapUrl: string) {
  await page.goto("/admin");
  // textarea / input 모두 한 번에 재설정 (mapUrl 만 의미 있게 변경)
  await page.getByTestId("venue-input-mapurl").fill(mapUrl);
  const responsePromise = page.waitForResponse((r) =>
    r.url().endsWith("/api/admin/save-venue"),
  );
  await page.getByTestId("venue-save").click();
  return responsePromise;
}

test.describe("dev-preview · 공연장 지도 OG 자동 스크래핑", () => {
  test("OG 이미지가 있는 URL → mapImage 가 반환되고 홈에서 이미지 미리보기 사용", async ({
    page,
  }) => {
    mock.setWithOg(true);
    const res = await saveVenue(page, mock.url);
    expect(res.status()).toBe(200);
    const body = (await res.json()) as {
      mapImage: { url: string } | null;
      mapImageError: string | null;
    };
    expect(body.mapImage).not.toBeNull();
    expect(body.mapImage!.url).toMatch(/\/uploads\/venue-map-preview\.jpg/);
    expect(body.mapImageError).toBeNull();

    await page.goto("/");
    const preview = page.getByTestId("venue-map-preview");
    await expect(preview).toHaveAttribute("data-source", "og-image");
    await expect(page.getByTestId("venue-map-image")).toBeVisible();
  });

  test("OG 이미지가 없는 URL → mapImage null + 안내 메시지 반환, SVG mockup fallback", async ({
    page,
  }) => {
    mock.setWithOg(false);
    const res = await saveVenue(page, mock.url);
    expect(res.status()).toBe(200);
    const body = (await res.json()) as {
      mapImage: unknown;
      mapImageError: string | null;
    };
    expect(body.mapImage).toBeNull();
    expect(body.mapImageError).toMatch(/og:image/);

    await page.goto("/");
    const preview = page.getByTestId("venue-map-preview");
    await expect(preview).toHaveAttribute("data-source", "svg-mockup");
    await expect(page.getByTestId("venue-map-svg")).toBeVisible();
  });

  test("URL 을 비우면 자동 미리보기가 제거된다", async ({ page }) => {
    mock.setWithOg(true);
    await saveVenue(page, mock.url);

    await page.goto("/admin");
    await page.getByTestId("venue-input-mapurl").fill("");
    const responsePromise = page.waitForResponse((r) =>
      r.url().endsWith("/api/admin/save-venue"),
    );
    await page.getByTestId("venue-save").click();
    const res = await responsePromise;
    const body = (await res.json()) as { mapImage: unknown };
    expect(body.mapImage).toBeNull();

    await page.goto("/");
    const preview = page.getByTestId("venue-map-preview");
    await expect(preview).toHaveAttribute("data-source", "svg-mockup");
  });
});
