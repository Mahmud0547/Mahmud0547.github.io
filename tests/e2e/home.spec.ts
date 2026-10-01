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
  await expect(work.getByRole("link", { name: "Read the case study" })).toHaveAttribute("href", "/work/simorgh/");
});

test("external links open safely in a new tab", async ({ page }) => {
  await page.goto("/");
  const external = page.locator('a[href^="http"]');
  for (const link of await external.all()) {
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", /noopener/);
  }
});

test("services list three packages with order links", async ({ page }) => {
  await page.goto("/");
  const services = page.locator("#services");
  await expect(services.getByRole("heading", { level: 3 })).toHaveText(["AI Starter Bot", "AI Bot + Database", "Full AI System"]);
  await expect(services).toContainText("$50");
  await expect(services).toContainText("$140");
  await expect(services).toContainText("$320");
  await expect(services.getByRole("link", { name: "Order on Fiverr" })).toHaveCount(3);
  await expect(services.getByRole("link", { name: "Order on Upwork" })).toHaveCount(3);
  await expect(services.getByRole("link", { name: "Order on Fiverr" }).first()).toHaveAttribute("href", "https://www.fiverr.com/s/3A8051m");
  await expect(services.getByText("Recommended")).toHaveCount(1);
  await expect(services.getByRole("link", { name: "Describe your task" })).toHaveAttribute("href", "/#contact");
});

test("process lists four numbered steps", async ({ page }) => {
  await page.goto("/");
  const steps = page.locator("#process ol > li");
  await expect(steps).toHaveCount(4);
  await expect(page.locator("#process h3")).toHaveText(["Plan", "Build", "Test", "Deliver"]);
});

test("about shows photo, facts, skills and the certificate", async ({ page }) => {
  await page.goto("/");
  const about = page.locator("#about");
  await expect(about.getByRole("heading", { level: 2 })).toHaveText("Hi, I'm Mahmud");
  await expect(about.getByRole("img", { name: "Mahmud Faiezov with an eagle" })).toBeVisible();
  await expect(about.locator("dt")).toHaveText(["Based in", "Languages", "Studying"]);
  await expect(about.getByRole("listitem").filter({ hasText: "FastAPI" })).toHaveCount(1);
  await expect(about.getByRole("link", { name: "Verify certificate" })).toHaveAttribute(
    "href",
    "https://freecodecamp.org/certification/makha_0547/responsive-web-design-v9",
  );
});

test("about text uses the serif font", async ({ page }) => {
  await page.goto("/");
  const family = await page.locator("#about p.font-serif").first().evaluate((el) => getComputedStyle(el).fontFamily);
  expect(family).toMatch(/source.?serif/i);
});

test("contact lists the three questions and every channel", async ({ page }) => {
  await page.goto("/");
  const contact = page.locator("#contact");
  await expect(contact.getByRole("heading", { level: 2 })).toHaveText("Tell me what you want to automate");
  await expect(contact.locator("ol > li")).toHaveCount(3);
  const expected = {
    Telegram: "https://t.me/Simorgh_Dev",
    GitHub: "https://github.com/Mahmud0547",
    LinkedIn: "https://www.linkedin.com/in/mahmud-faiezov",
    Instagram: "https://www.instagram.com/mahmud.simorghdev",
    Fiverr: "https://www.fiverr.com/s/3A8051m",
    Upwork: "https://www.upwork.com/freelancers/~01b20f000a77d7d8e3",
  };
  for (const [name, href] of Object.entries(expected)) {
    await expect(contact.getByRole("link", { name, exact: true })).toHaveAttribute("href", href);
  }
});

test("footer shows the current year and the privacy link", async ({ page }) => {
  await page.goto("/");
  const footer = page.getByRole("contentinfo");
  await expect(footer).toContainText(`© ${new Date().getFullYear()} Mahmud Faiezov`);
  await expect(footer.getByRole("link", { name: "Privacy" })).toHaveAttribute("href", "/privacy/");
});
