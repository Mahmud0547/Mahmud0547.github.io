import { expect, test } from "@playwright/test";

test("home page is served from the static export", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page.locator("h1")).toHaveCount(1);
});
