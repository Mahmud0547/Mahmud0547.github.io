import { expect, test } from "@playwright/test";

for (const [path, lang, title] of [
  ["/privacy/", "en", "Privacy"],
  ["/ru/privacy/", "ru", "Конфиденциальность"],
  ["/tj/privacy/", "tg", "Махфият"],
] as const) {
  test(`privacy page ${path}`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator("html")).toHaveAttribute("lang", lang);
    await expect(page.locator("h1")).toHaveText(title);
    await expect(page.locator("main h2")).toHaveCount(5);
  });
}

test("privacy page names Turnstile and the contact form honestly", async ({ page }) => {
  await page.goto("/privacy/");
  await expect(page.locator("main")).toContainText("Cloudflare Turnstile");
  await expect(page.locator("main")).toContainText("not stored in a database");
});

test("footer links to the privacy page in every language", async ({ page }) => {
  for (const [path, href, name] of [["/", "/privacy/", "Privacy"], ["/tj/", "/tj/privacy/", "Махфият"]]) {
    await page.goto(path);
    await expect(page.getByRole("contentinfo").getByRole("link", { name })).toHaveAttribute("href", href);
  }
});

test("unknown pages show a branded 404 with a way home", async ({ page }) => {
  const response = await page.goto("/no-such-page/");
  expect(response?.status()).toBe(404);
  await expect(page.locator("h1")).toHaveText("Page not found");
  await expect(page.getByText("404")).toBeVisible();
  await expect(page.getByRole("link", { name: "Back to the home page" })).toHaveAttribute("href", "/");
  await expect(page.getByRole("link", { name: /SimorghDev/ })).toBeVisible();
});
