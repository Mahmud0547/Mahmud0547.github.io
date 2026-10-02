import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("blog lists the articles newest first", async ({ page }) => {
  await page.goto("/blog/");
  await expect(page.locator("h1")).toHaveText("Blog");
  await expect(page.locator("main h2")).toHaveText([
    "How a Telegram bot works — explained so a child could get it",
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
  await expect(page.getByText("Некоторые статьи пока только на английском.")).toBeVisible();
  await page.getByRole("link", { name: "An AI newsroom with a human in the loop" }).click();
  await expect(page).toHaveURL(/\/ru\/blog\/ai-newsroom-human-in-the-loop\/$/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://simorghdev.pages.dev/blog/ai-newsroom-human-in-the-loop/");
});

test("header links to the blog", async ({ page, isMobile }) => {
  test.skip(isMobile, "desktop navigation");
  await page.goto("/");
  await expect(page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Blog" })).toHaveAttribute("href", "/blog/");
});

const BOT = "/blog/how-a-telegram-bot-works/";

test("a translated article has its own canonical URL, language and hreflang links", async ({ page }) => {
  await page.goto(`/tj${BOT}`);
  await expect(page.locator("h1")).toContainText("Боти Telegram");
  await expect(page.locator("article")).toHaveAttribute("lang", "tg");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://simorghdev.pages.dev/tj${BOT}`);
  await expect(page.locator('link[rel="alternate"][hreflang="ru"]')).toHaveAttribute("href", `https://simorghdev.pages.dev/ru${BOT}`);
  await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveAttribute("href", `https://simorghdev.pages.dev${BOT}`);
});

test("the message journey steps forward and back", async ({ page }) => {
  await page.goto(BOT);
  const demo = page.getByRole("region", { name: "A message's journey" });
  await expect(demo.getByText("Step 1 of 6")).toBeVisible();
  await demo.getByRole("button", { name: "100 usd" }).click();
  await demo.getByRole("button", { name: /Next step/ }).click();
  await expect(demo.getByText("Step 2 of 6")).toBeVisible();
  await expect(demo.locator("pre")).toContainText('"text": "100 usd"');
  await demo.getByRole("button", { name: /Back/ }).click();
  await expect(demo.getByText("Step 1 of 6")).toBeVisible();
});

test("the bot playground answers by the first matching rule", async ({ page }) => {
  await page.goto(BOT);
  const demo = page.getByRole("region", { name: "Build your own bot" });
  await demo.getByLabel("Write to your bot…").fill("What is the PRICE?");
  await demo.getByRole("button", { name: "Send" }).click();
  await expect(demo.getByText("Our prices start at $50. Want the full list?", { exact: true })).toBeVisible();
  await expect(demo.getByText("rule 1 fired")).toBeVisible();
  await demo.getByLabel("Write to your bot…").fill("hello");
  await demo.getByRole("button", { name: "Send" }).click();
  await expect(demo.getByText("no rule fired — default answer")).toBeVisible();
  await demo.getByText("The same bot in Python").click();
  await expect(demo.locator("pre")).toContainText('if "price" in text:');
});

test("the amount demo asks when the currency is missing", async ({ page }) => {
  await page.goto(BOT);
  const demo = page.getByRole("region", { name: "How a bot understands “100 usd”" });
  await demo.getByLabel("Type an amount, the way a person would").fill("500");
  await expect(demo.getByText("There is no currency, so the bot asks: “Which currency?”")).toBeVisible();
});

test("the quiz explains every answer and counts the score", async ({ page }) => {
  await page.goto(BOT);
  const quiz = page.getByRole("region", { name: "Check yourself" });
  await quiz.getByRole("button", { name: "To Telegram's servers" }).click();
  await expect(quiz.getByText("✓ Correct!")).toBeVisible();
  await quiz.getByRole("button", { name: "The last one" }).click();
  await expect(quiz.getByText("✗ Not quite.")).toBeVisible();
  for (const answer of ["Ask which currency", /rings the doorbell/, "Revoke it in @BotFather and use the new one"]) {
    await quiz.getByRole("button", { name: answer }).click();
  }
  await expect(quiz.getByText("4 of 5 correct")).toBeVisible();
});

for (const path of ["/blog/", "/blog/official-data-you-can-trust/", "/tj/blog/", BOT, `/tj${BOT}`]) {
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
