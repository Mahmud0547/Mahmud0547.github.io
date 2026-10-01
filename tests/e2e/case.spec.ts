import { expect, test } from "@playwright/test";

const pages = [
  { path: "/work/simorgh/", lang: "en", title: "Simorgh News: an AI newsroom for a Telegram channel", back: "/#work" },
  { path: "/ru/work/simorgh/", lang: "ru", title: "Simorgh News: ИИ-редакция для Telegram-канала", back: "/ru/#work" },
  { path: "/tj/work/simorgh/", lang: "tg", title: "Simorgh News: таҳририяи зеҳни сунъӣ барои канали Telegram", back: "/tj/#work" },
];

for (const { path, lang, title, back } of pages) {
  test(`case study ${path} is a full page`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator("html")).toHaveAttribute("lang", lang);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toHaveText(title);
    await expect(page.locator("main h2")).toHaveCount(7);
    await expect(page.locator("main a[href='" + back + "']").first()).toBeVisible();
  });
}

test("case study shows real numbers and the architecture", async ({ page }) => {
  await page.goto("/work/simorgh/");
  const main = page.locator("main");
  await expect(main).toContainText("558 articles collected and 7 posts published");
  const diagram = main.getByRole("img", { name: /Architecture: RSS feeds/ });
  await expect(diagram).toBeVisible();
  await expect(main.locator("ol li")).toHaveCount(4);
  await expect(main.getByRole("link", { name: "Describe your task" })).toHaveAttribute("href", "/#contact");
});

test("language switcher keeps the visitor on the case study", async ({ page, isMobile }) => {
  test.skip(isMobile, "desktop switcher");
  await page.goto("/work/simorgh/");
  await expect(page.getByRole("link", { name: "RU" }).first()).toHaveAttribute("href", "/ru/work/simorgh/");
});

test("home page links to the case study", async ({ page }) => {
  await page.goto("/ru/");
  await expect(page.locator("#work").getByRole("link", { name: "Читать кейс" })).toHaveAttribute("href", "/ru/work/simorgh/");
});
