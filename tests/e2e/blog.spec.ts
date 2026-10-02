import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const LESSONS = [
  "How a Telegram bot works — explained so a child could get it",
  "How an AI newsroom works — and why a person still has the last word",
  "Where exchange rates come from — and how to build a site people can trust",
  "Who can see what: why access rules belong in the database",
  "A website for slow internet: what a page really downloads",
];

test("the blog shows the course with its lessons in order", async ({ page }) => {
  await page.goto("/blog/");
  await expect(page.locator("h1")).toHaveText("Blog");
  const course = page.getByRole("region", { name: "How it works" });
  await expect(course.getByRole("listitem")).toHaveCount(5);
  for (const [i, title] of LESSONS.entries()) {
    await expect(course.getByRole("listitem").nth(i)).toContainText(`Lesson ${i + 1} of 5`);
    await expect(course.getByRole("listitem").nth(i)).toContainText(title);
  }
  await expect(course.getByText("0 of 5 lessons finished")).toBeVisible();
});

test("a lesson has its header, what you will learn, code and structured data", async ({ page }) => {
  await page.goto("/blog/access-rules-in-the-database/");
  await expect(page.locator("h1")).toHaveText(LESSONS[3]!);
  await expect(page.getByText("How it works · Lesson 4 of 5")).toBeVisible();
  await expect(page.getByText("Intermediate", { exact: true })).toBeVisible();
  await expect(page.getByRole("region", { name: /In this lesson you will learn/ }).getByRole("listitem")).toHaveCount(5);
  await expect(page.locator("article pre code").first()).toContainText("create policy");
  const ld = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent()) ?? "{}");
  expect(ld["@type"]).toBe("BlogPosting");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://simorghdev.pages.dev/blog/access-rules-in-the-database/");
});

test("finishing a lesson is remembered in the course list", async ({ page }) => {
  await page.goto("/blog/how-a-telegram-bot-works/");
  await page.getByRole("button", { name: "✓ I finished this lesson" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Lesson finished" })).toBeVisible();
  await page.getByRole("link", { name: /Next lesson/ }).click();
  await expect(page).toHaveURL(/\/blog\/ai-newsroom-human-in-the-loop\/$/);
  await page.goto("/blog/");
  await expect(page.getByText("1 of 5 lessons finished")).toBeVisible();
});

test("the contents link to the sections of the lesson", async ({ page, isMobile }) => {
  await page.goto("/blog/official-data-you-can-trust/");
  if (isMobile) await page.locator("summary", { hasText: "Contents" }).click();
  const toc = page.getByRole("navigation", { name: "Contents" }).filter({ visible: true });
  await toc.getByRole("link", { name: /The nominal trap/ }).click();
  await expect(page).toHaveURL(/#s3$/);
  await expect(page.locator("#s3")).toHaveText("The nominal trap");
});

test("key ideas are shown as callouts", async ({ page }) => {
  await page.goto("/blog/ai-newsroom-human-in-the-loop/");
  await expect(page.locator("article aside").filter({ hasText: "Key idea" }).first()).toContainText("very fast intern");
});

test("Russian blog keeps the Russian interface and Russian lessons", async ({ page }) => {
  await page.goto("/ru/blog/");
  await expect(page.locator("h1")).toHaveText("Блог");
  await expect(page.getByText("Некоторые статьи пока только на английском.")).toHaveCount(0);
  await page.getByRole("link", { name: /Как работает ИИ-редакция/ }).click();
  await expect(page).toHaveURL(/\/ru\/blog\/ai-newsroom-human-in-the-loop\/$/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://simorghdev.pages.dev/ru/blog/ai-newsroom-human-in-the-loop/");
  await expect(page.getByText("Как это работает · Урок 2 из 5")).toBeVisible();
});

test("header links to the blog", async ({ page, isMobile }) => {
  test.skip(isMobile, "desktop navigation");
  await page.goto("/");
  await expect(page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Blog" })).toHaveAttribute("href", "/blog/");
});

const BOT = "/blog/how-a-telegram-bot-works/";

/** An interactive demo, once its code has loaded and it responds to input. */
async function demoBlock(page: Page, name: string) {
  const region = page.locator("section[data-ready]").filter({ has: page.getByRole("heading", { name, exact: true }) });
  await expect(region).toHaveAttribute("data-ready", "true");
  return region;
}

test("a translated article has its own canonical URL, language and hreflang links", async ({ page }) => {
  await page.goto(`/tj${BOT}`);
  await expect(page.locator("h1")).toContainText("Боти Telegram");
  await expect(page.locator("article")).toHaveAttribute("lang", "tg");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://simorghdev.pages.dev/tj${BOT}`);
  await expect(page.locator('link[rel="alternate"][hreflang="ru"]')).toHaveAttribute("href", `https://simorghdev.pages.dev/ru${BOT}`);
  await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveAttribute("href", `https://simorghdev.pages.dev${BOT}`);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", "https://simorghdev.pages.dev/og/blog/tj-how-a-telegram-bot-works.png");
  expect((await page.request.get("/og/blog/tj-how-a-telegram-bot-works.png")).headers()["content-type"]).toContain("image/png");
});

test("the message journey steps forward and back", async ({ page }) => {
  await page.goto(BOT);
  const demo = await demoBlock(page, "A message's journey");
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
  const demo = await demoBlock(page, "Build your own bot");
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
  const demo = await demoBlock(page, "How a bot understands “100 usd”");
  await demo.getByLabel("Type an amount, the way a person would").fill("500");
  await expect(demo.getByText("There is no currency, so the bot asks: “Which currency?”")).toBeVisible();
});

test("the quiz explains every answer and counts the score", async ({ page }) => {
  await page.goto(BOT);
  const quiz = await demoBlock(page, "Check yourself");
  await quiz.getByRole("button", { name: "To Telegram's servers" }).click();
  await expect(quiz.getByText("✓ Correct!")).toBeVisible();
  await quiz.getByRole("button", { name: "The last one" }).click();
  await expect(quiz.getByText("✗ Not quite.")).toBeVisible();
  for (const answer of ["Ask which currency", /rings the doorbell/, "Revoke it in @BotFather and use the new one"]) {
    await quiz.getByRole("button", { name: answer }).click();
  }
  await expect(quiz.getByText("4 of 5 correct")).toBeVisible();
});

test("lesson 2: the editor game and the letter check", async ({ page }) => {
  await page.goto("/blog/ai-newsroom-human-in-the-loop/");
  const editor = await demoBlock(page, "You are the editor");
  await editor.getByRole("button", { name: "✓ Approve" }).first().click();
  await expect(editor.getByText("Look again.")).toBeVisible();
  const letters = await demoBlock(page, "The letter check");
  await letters.getByRole("button", { name: "Russian post" }).click();
  await expect(letters.getByText(/goes to the editor/)).toBeVisible();
  await letters.getByRole("button", { name: "Model thinking out loud" }).click();
  await expect(letters.getByText(/rejected, the next model is asked/)).toBeVisible();
  // The blind spot the lesson teaches: Tajik shares most letters with Russian and passes.
  await letters.getByRole("button", { name: "Tajik text" }).click();
  await expect(letters.getByText(/goes to the editor/)).toBeVisible();
  const chain = await demoBlock(page, "The fallback chain");
  await chain.getByRole("button", { name: /Write the post/ }).click();
  await expect(chain.getByText("Model C: wrote the post ✓")).toBeVisible();
});

test("lesson 3: the nominal trap and the outage", async ({ page }) => {
  await page.goto("/blog/official-data-you-can-trust/");
  const nominal = await demoBlock(page, "The nominal trap");
  await expect(nominal.getByText("1,000 × 0.2089 ÷ 10 = 20.89 TJS")).toBeVisible();
  const outage = await demoBlock(page, "When the source goes down");
  await outage.getByLabel(/The bank's website is down/).check();
  await expect(outage.getByText("Error: could not load the rates")).toBeVisible();
  await expect(outage.getByText(/last saved official rate/)).toBeVisible();
});

test("lesson 4: rules in the app leak, rules in the database refuse; links expire", async ({ page }) => {
  await page.goto("/blog/access-rules-in-the-database/");
  const access = await demoBlock(page, "Who may do what");
  await access.getByRole("button", { name: /straight to the database/ }).click();
  await expect(access.getByText(/The data has leaked/)).toBeVisible();
  await access.getByRole("button", { name: "In the database" }).click();
  await access.getByRole("button", { name: /straight to the database/ }).click();
  await expect(access.getByText(/Refused by the database/)).toBeVisible();
  const link = await demoBlock(page, "A link that expires");
  await link.getByRole("button", { name: /Get the download link/ }).click();
  await link.getByRole("button", { name: /Skip 30 seconds/ }).click();
  await link.getByRole("button", { name: /Skip 30 seconds/ }).click();
  await link.getByRole("button", { name: "Open the link" }).click();
  await expect(link.getByText(/this link has expired/)).toBeVisible();
});

test("lesson 5: the light version of the page is ready sooner and skips the photos", async ({ page }) => {
  await page.goto("/blog/websites-for-slow-internet/");
  const demo = await demoBlock(page, "How long does this page take?");
  const seconds = async (label: string) =>
    Number((await demo.getByText(label, { exact: true }).locator("..").locator("span").nth(1).innerText()).replace(/[^\d.]/g, ""));

  await demo.getByRole("button", { name: "3G" }).click();
  await expect(demo.getByRole("button", { name: "3G" })).toHaveAttribute("aria-pressed", "true");
  const full3g = await seconds("Full version");
  const lite3g = await seconds("Light version");
  expect(lite3g).toBeLessThan(full3g);
  await expect(demo.getByText(/downloads 342 KB less/)).toBeVisible();

  await demo.getByRole("button", { name: "2G" }).click();
  expect(await seconds("Full version")).toBeGreaterThan(full3g);
  await expect(demo.getByRole("row", { name: /Photos/ })).toContainText("waits for a tap");
});

test("the blog has an Articles card next to the course, with the case and its result", async ({ page }) => {
  await page.goto("/blog/");
  const articles = page.getByRole("region", { name: "Automation in practice" });
  await expect(articles.getByText("Articles", { exact: true })).toBeVisible();
  const card = articles.getByRole("link", { name: /One person and an AI bot run a news channel/ });
  await expect(card).toHaveAttribute("href", "/blog/automating-a-telegram-news-channel-with-ai/");
  await expect(card).toContainText("270 articles a day read by the bot");
  // Articles are not lessons: the course still has five.
  await expect(page.getByRole("region", { name: "How it works" }).getByRole("listitem")).toHaveCount(5);
});

test("an article is a case study that ends with a call to order", async ({ page }) => {
  await page.goto("/ru/blog/automating-a-telegram-news-channel-with-ai/");
  await expect(page.getByText("Кейс", { exact: true }).first()).toBeVisible();
  await expect(page.getByText(/Урок \d из/)).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Хотите так же для своего бизнеса?" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Описать задачу" })).toHaveAttribute("href", "/ru/#contact");
  await expect(page.getByRole("link", { name: "Пакеты и цены" })).toHaveAttribute("href", "/ru/#services");
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /\/og\/blog\/ru-automating-a-telegram-news-channel-with-ai\.png$/);
});

test("the routine calculator shows hours saved and when a bot pays off", async ({ page }) => {
  await page.goto("/blog/automating-a-telegram-news-channel-with-ai/");
  const demo = await demoBlock(page, "What does your routine cost?");
  await expect(demo.getByRole("button", { name: "Answering the same customer questions" })).toHaveAttribute("aria-pressed", "true");
  await expect(demo).toContainText("44 h a month");
  await expect(demo).toContainText(/pays for itself in \d+ working days/);
  await demo.getByLabel(/Minutes to check, with a bot/).fill("30");
  await expect(demo).toContainText("a bot would not help");
});

const LESSON_PATHS = [
  "/blog/ai-newsroom-human-in-the-loop/",
  "/blog/official-data-you-can-trust/",
  "/blog/access-rules-in-the-database/",
  "/blog/websites-for-slow-internet/",
  "/blog/automating-a-telegram-news-channel-with-ai/",
];

for (const path of ["/blog/", "/tj/blog/", BOT, `/tj${BOT}`, ...LESSON_PATHS, ...LESSON_PATHS.map((p) => `/tj${p}`)]) {
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
