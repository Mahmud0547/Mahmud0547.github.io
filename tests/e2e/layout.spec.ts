import { expect, test } from "@playwright/test";

const pages = ["/", "/ru/", "/tj/"];

for (const path of pages) {
  test(`no horizontal scroll at 320px on ${path}`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto(path);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test(`sections appear in the design order on ${path}`, async ({ page }) => {
    await page.goto(path);
    const ids = await page.locator("main > section[id], main > div > section[id]").evaluateAll((nodes) => nodes.map((n) => n.id));
    expect(ids.filter((id) => ["work", "services", "process", "about", "contact"].includes(id))).toEqual([
      "work",
      "services",
      "process",
      "about",
      "contact",
    ]);
  });

  test(`one h1 and no skipped heading levels on ${path}`, async ({ page }) => {
    await page.goto(path);
    const levels = await page.locator("h1, h2, h3, h4").evaluateAll((nodes) => nodes.map((n) => Number(n.tagName[1])));
    expect(levels.filter((level) => level === 1)).toHaveLength(1);
    for (let i = 1; i < levels.length; i++) {
      expect(levels[i] - levels[i - 1]).toBeLessThanOrEqual(1);
    }
  });
}
