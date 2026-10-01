import { expect, test } from "@playwright/test";

const live = {
  articles: 612,
  reviewed: 15,
  published: 9,
  latest: { source: "Al Jazeera – Breaking News, World News and Video from Al Jazeera", title: "Live headline" },
  updated_at: "2026-10-02T08:00:00+00:00",
};

const pipelineOf = (page: import("@playwright/test").Page) => page.getByRole("region", { name: "Simorgh, my AI newsroom" });

test("shows live numbers when the API answers", async ({ page }) => {
  await page.route("**/public/stats", (route) => route.fulfill({ json: live }));
  await page.goto("/");
  const pipeline = pipelineOf(page);
  await expect(pipeline).toContainText("Live");
  await expect(pipeline).toContainText("612 articles");
  await expect(pipeline).toContainText("9 published");
  await expect(pipeline).toContainText("Live headline");
  await expect(pipeline).toContainText("Latest from Al Jazeera");
  await expect(pipeline).not.toContainText("Breaking News");
});

test("falls back to the snapshot when the API fails", async ({ page }) => {
  await page.route("**/public/stats", (route) => route.fulfill({ status: 500, body: "no" }));
  await page.goto("/");
  const pipeline = pipelineOf(page);
  await expect(pipeline).toContainText("558 articles");
  await expect(pipeline).toContainText("Updated October 1, 2026");
  await expect(pipeline).not.toContainText("Live");
});

test("falls back to the snapshot when the API answers garbage", async ({ page }) => {
  await page.route("**/public/stats", (route) => route.fulfill({ json: { ...live, articles: "lots" } }));
  await page.goto("/");
  await expect(pipelineOf(page)).toContainText("558 articles");
  await expect(pipelineOf(page)).not.toContainText("Live");
});

test("animates the steps when motion is allowed", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await expect(page.locator("[data-packet]")).toHaveCount(1);
  const first = await page.locator("[data-active-step]").getAttribute("data-active-step");
  await expect(page.locator("[data-active-step]")).not.toHaveAttribute("data-active-step", first!, { timeout: 3000 });
});

test("does not animate with reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.route("**/public/stats", (route) => route.fulfill({ json: live }));
  await page.goto("/");
  await expect(pipelineOf(page)).toContainText("612 articles");
  await expect(page.locator("[data-packet]")).toHaveCount(0);
  await expect(page.locator("[data-active-step]")).toHaveCount(0);
});

test("renders text from the API as text", async ({ page }) => {
  let dialogs = 0;
  page.on("dialog", (dialog) => {
    dialogs++;
    void dialog.dismiss();
  });
  await page.route("**/public/stats", (route) =>
    route.fulfill({ json: { ...live, latest: { source: "x", title: "<img src=x onerror=alert(1)>" } } }),
  );
  await page.goto("/");
  await expect(pipelineOf(page)).toContainText("<img src=x onerror=alert(1)>");
  await expect(page.locator("img[src='x']")).toHaveCount(0);
  expect(dialogs).toBe(0);
});

test("logs no errors while loading live data", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("**/public/stats", (route) => route.abort());
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  expect(errors).toEqual([]);
});
