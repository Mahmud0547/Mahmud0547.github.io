import { expect, test } from "@playwright/test";

test("hero has one h1 and calls to action", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("h1")).toHaveText("Telegram bots and AI automation that run 24/7");
  await expect(page.getByRole("link", { name: "See my work" })).toHaveAttribute("href", "/#work");
  await expect(page.getByRole("link", { name: "Order a bot" })).toHaveAttribute("href", "/#services");
});

test("pipeline shows snapshot numbers and never claims to be live", async ({ page }) => {
  await page.goto("/");
  const pipeline = page.getByRole("region", { name: "Simorgh, my AI newsroom" });
  await expect(pipeline).toContainText("558 articles");
  await expect(pipeline).toContainText("12 reviewed");
  await expect(pipeline).toContainText("7 published");
  await expect(pipeline).toContainText("Updated October 1, 2026");
  await expect(pipeline).toContainText("Jacks stars as England grind out win over Sri Lanka");
  await expect(pipeline).not.toContainText("Live");
  await expect(pipeline).not.toContainText("Writing now");
});

test("pipeline is translated", async ({ page }) => {
  await page.goto("/ru/");
  await expect(page.locator("h1")).not.toHaveText("Telegram bots and AI automation that run 24/7");
  await expect(page.getByRole("link", { name: /работ/i }).first()).toHaveAttribute("href", "/ru/#work");
});

test("trust strip lists three promises", async ({ page }) => {
  await page.goto("/");
  const strip = page.getByRole("list", { name: "Why clients can trust the work" });
  await expect(strip.getByRole("listitem")).toHaveCount(3);
});

test("work section shows the case and two projects with real links", async ({ page }) => {
  await page.goto("/");
  const work = page.locator("#work");
  await expect(work.getByRole("heading", { level: 2, name: "Selected work" })).toBeVisible();
  await expect(work.getByRole("heading", { level: 3 })).toHaveText(["Simorgh News", "Kamarob Nature Fund", "Simorgh Dawn"]);
  await expect(work).toContainText("558 articles processed");
  await expect(work.getByRole("link", { name: /Live site/ }).first()).toHaveAttribute(
    "href",
    "https://mahmud0547.github.io/kamarob-nature-fund/",
  );
  await expect(work.getByRole("link", { name: "All projects on GitHub" })).toHaveAttribute("href", "https://github.com/Mahmud0547");
  for (const img of await work.locator("img").all()) {
    await expect(img).toHaveAttribute("alt", /.+/);
  }
  await expect(work.getByRole("link", { name: "Read the case study" })).toHaveCount(0);
});

test("external links open safely in a new tab", async ({ page }) => {
  await page.goto("/");
  const external = page.locator('a[href^="http"]');
  for (const link of await external.all()) {
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", /noopener/);
  }
});
