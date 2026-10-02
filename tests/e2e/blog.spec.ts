import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("blog lists the articles newest first", async ({ page }) => {
  await page.goto("/blog/");
  await expect(page.locator("h1")).toHaveText("Blog");
  await expect(page.locator("main h2")).toHaveText([
    "An AI newsroom with a human in the loop",
    "Official data only: building a currency service people can trust",
    "Why access rules belong in the database",
  ]);
});

test("an article renders headings, lists, code and structured data", async ({ page }) => {
  await page.goto("/blog/access-rules-in-the-database/");
  await expect(page.locator("h1")).toHaveText("Why access rules belong in the database");
  await expect(page.locator("article pre code").first()).toContainText("create policy");
  await expect(page.locator("article li").first()).toBeVisible();
  const ld = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent()) ?? "{}");
  expect(ld["@type"]).toBe("BlogPosting");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://simorghdev.pages.dev/blog/access-rules-in-the-database/");
});

test("Russian blog keeps the Russian interface and points the article canonical to English", async ({ page }) => {
  await page.goto("/ru/blog/");
  await expect(page.locator("h1")).toHaveText("Блог");
  await expect(page.getByText("Статьи написаны на английском.")).toBeVisible();
  await page.getByRole("link", { name: "An AI newsroom with a human in the loop" }).click();
  await expect(page).toHaveURL(/\/ru\/blog\/ai-newsroom-human-in-the-loop\/$/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://simorghdev.pages.dev/blog/ai-newsroom-human-in-the-loop/");
});

test("header links to the blog", async ({ page, isMobile }) => {
  test.skip(isMobile, "desktop navigation");
  await page.goto("/");
  await expect(page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Blog" })).toHaveAttribute("href", "/blog/");
});

for (const path of ["/blog/", "/blog/official-data-you-can-trust/", "/tj/blog/"]) {
  test(`no WCAG A/AA violations on ${path}`, async ({ page }) => {
    await page.goto(path);
    const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
    expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
  });

  test(`no horizontal scroll at 320px on ${path}`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto(path);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
  });
}
