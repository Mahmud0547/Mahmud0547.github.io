import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

async function violations(page: Page) {
  const { violations } = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    // Experimental in axe, but Lighthouse checks it: visible text must be part of the accessible name (WCAG 2.5.3).
    .options({ rules: { "label-content-name-mismatch": { enabled: true } } })
    .analyze();
  return violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`);
}

for (const path of ["/", "/ru/", "/tj/", "/work/simorgh/", "/tj/work/simorgh/", "/privacy/", "/ru/privacy/", "/no-such-page/"]) {
  test(`no WCAG A/AA violations on ${path}`, async ({ page }) => {
    await page.goto(path);
    expect(await violations(page)).toEqual([]);
  });
}

// Every colour in the dark theme must pass the same contrast checks as the light one.
for (const path of ["/", "/tj/", "/work/simorgh/", "/privacy/", "/blog/", "/blog/how-a-telegram-bot-works/", "/no-such-page/"]) {
  test(`no WCAG A/AA violations on ${path} in the dark theme`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto(path);
    expect(await violations(page)).toEqual([]);
  });
}

test("no WCAG A/AA violations in the light version with its banner", async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, "connection", { value: { effectiveType: "2g" } }));
  for (const scheme of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme: scheme });
    await page.goto("/");
    await expect(page.getByText("Slow internet detected")).toBeVisible();
    expect(await violations(page), scheme).toEqual([]);
  }
});
