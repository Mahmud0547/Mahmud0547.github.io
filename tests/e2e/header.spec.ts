import { expect, test } from "@playwright/test";

const switcherCases = [
  { path: "/", current: "EN" },
  { path: "/ru/", current: "RU" },
  { path: "/tj/", current: "TJ" },
];

for (const { path, current } of switcherCases) {
  test(`language switcher on ${path}`, async ({ page, isMobile }) => {
    await page.goto(path);
    if (isMobile) await page.locator('button[aria-controls="mobile-menu"]').click();
    const nav = page.getByRole("navigation", { name: /language|язык|забон/i }).filter({ visible: true });
    await expect(nav.getByRole("link", { name: "EN" })).toHaveAttribute("href", "/");
    await expect(nav.getByRole("link", { name: "RU" })).toHaveAttribute("href", "/ru/");
    await expect(nav.getByRole("link", { name: "TJ" })).toHaveAttribute("href", "/tj/");
    await expect(nav.getByRole("link", { name: "TJ" })).toHaveAttribute("hreflang", "tg");
    await expect(nav.getByRole("link", { name: current })).toHaveAttribute("aria-current", "page");
  });
}

test("skip link moves focus to the main content", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to content" });
  await expect(skip).toBeFocused();
  await expect(skip).toBeVisible();
  await expect(skip).toHaveAttribute("href", "#main");
});

test.describe("mobile menu", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("opens with Enter, closes with Escape and returns focus", async ({ page }) => {
    await page.goto("/");
    const button = page.getByRole("button", { name: "Open menu" });
    await button.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("button", { name: "Close menu" })).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator("#mobile-menu").getByRole("link", { name: "Work" })).toBeVisible();
    await page.keyboard.press("Escape");
    const reopened = page.getByRole("button", { name: "Open menu" });
    await expect(reopened).toHaveAttribute("aria-expanded", "false");
    await expect(reopened).toBeFocused();
    await expect(page.locator("#mobile-menu")).toBeHidden();
  });

  test("closes after choosing a section", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Open menu" }).click();
    await page.locator("#mobile-menu").getByRole("link", { name: "Services" }).click();
    await expect(page.locator("#mobile-menu")).toBeHidden();
    await expect(page).toHaveURL(/#services$/);
  });
});

test("desktop navigation links to the home page sections", async ({ page, isMobile }) => {
  test.skip(isMobile, "desktop navigation is hidden on phones");
  await page.goto("/ru/");
  const nav = page.locator("header nav").first();
  const hrefs = await nav.getByRole("link").evaluateAll((links) => links.map((a) => a.getAttribute("href")));
  expect(hrefs).toEqual(["/ru/#work", "/ru/#services", "/ru/#about", "/ru/#contact"]);
});
