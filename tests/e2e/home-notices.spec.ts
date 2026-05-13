import { expect, test } from "@playwright/test";

test.describe("홈 · 안내 문구 + 공연장 라벨", () => {
  test("좌석배치도 메뉴 desc 가 선착순 안내로 교체되어 있다", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.getByTestId("menu-card-search")).toContainText(
      "공연장에 오시는 순서대로 3층부터 4층까지 좌석을 배정해드립니다.",
    );
  });

  test("10분 전 입장 안내가 브로셔 메뉴 카드와 VenueCard 사이에 노출된다", async ({
    page,
  }) => {
    await page.goto("/");
    const notice = page.getByTestId("entry-notice");
    await expect(notice).toBeVisible();
    await expect(notice).toContainText(
      "공연시작 10분 전까지 공연장에 입장하시기 바랍니다.",
    );
  });

  test("VenueCard 라벨이 '공연장에 찾아오시는 길' 이며 주차 안내가 노출된다", async ({
    page,
  }) => {
    await page.goto("/");
    const card = page.getByTestId("venue-card");
    await expect(card).toContainText("공연장에 찾아오시는 길");

    await expect(page.getByTestId("venue-parking-notice")).toContainText(
      "주차공간이 협소한 관계로 가급적 대중교통 이용바랍니다.",
    );
  });
});
