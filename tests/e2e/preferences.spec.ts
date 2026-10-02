import { expect, test, type Page } from "@playwright/test";

const LIGHT_PAPER = "rgb(243, 244, 247)";
const DARK_PAPER = "rgb(11, 18, 48)";

const bodyBackground = (page: Page) => page.evaluate(() => getComputedStyle(document.body).backgroundColor);

/** Pretends the browser reports a slow connection (Network Information API) before any page script runs. */
async function slowConnection(page: Page, effectiveType = "2g") {
  await page.addInitScript((type) => {
    Object.defineProperty(navigator, "connection", { value: { effectiveType: type, saveData: false }, configurable: true });
  }, effectiveType);
}

/** Chooses a theme the way the visitor would: three buttons on desktop, one cycling button on phones. */
async function chooseTheme(page: Page, isMobile: boolean, name: "Light" | "Same as the device" | "Dark") {
  if (!isMobile) {
    await page.getByRole("group", { name: "Colour theme" }).getByRole("button", { name }).click();
    return;
  }
  const button = page.getByRole("button", { name: /^Colour theme:/ });
  for (let i = 0; i < 3 && (await button.getAttribute("aria-label")) !== `Colour theme: ${name}`; i++) await button.click();
  await expect(button).toHaveAttribute("aria-label", `Colour theme: ${name}`);
}

test.describe("colour theme", () => {
  test("follows the device until the visitor chooses", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    await expect(page.locator("html")).not.toHaveAttribute("data-theme", /.*/);
    expect(await bodyBackground(page)).toBe(DARK_PAPER);

    await page.emulateMedia({ colorScheme: "light" });
    expect(await bodyBackground(page)).toBe(LIGHT_PAPER);
  });

  test("a chosen theme wins over the device and survives a reload", async ({ page, isMobile }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");
    await chooseTheme(page, isMobile, "Dark");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    expect(await bodyBackground(page)).toBe(DARK_PAPER);

    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    expect(await bodyBackground(page)).toBe(DARK_PAPER);

    await chooseTheme(page, isMobile, "Same as the device");
    await expect(page.locator("html")).not.toHaveAttribute("data-theme", /.*/);
    expect(await bodyBackground(page)).toBe(LIGHT_PAPER);
    expect(await page.evaluate(() => localStorage.getItem("theme"))).toBeNull();
  });

  test("the saved theme is applied before the first paint", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("theme", "dark"));
    await page.emulateMedia({ colorScheme: "light" });
    // Read the attribute as soon as <body> exists, before React has loaded.
    await page.route("**/_next/static/**/*.js", (route) => new Promise(() => void route));
    await page.goto("/", { waitUntil: "commit" });
    await page.waitForSelector("body");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  });

  test("desktop marks the current choice as pressed", async ({ page, isMobile }) => {
    test.skip(isMobile, "phones use the single cycling button");
    await page.goto("/");
    const group = page.getByRole("group", { name: "Colour theme" });
    await expect(group.getByRole("button", { name: "Same as the device" })).toHaveAttribute("aria-pressed", "true");
    await group.getByRole("button", { name: "Light" }).click();
    await expect(group.getByRole("button", { name: "Light" })).toHaveAttribute("aria-pressed", "true");
    await expect(group.getByRole("button", { name: "Same as the device" })).toHaveAttribute("aria-pressed", "false");
  });
});

test.describe("light version", () => {
  test("switches on by itself on a slow connection and keeps photos until asked", async ({ page }) => {
    await slowConnection(page);
    const photoRequests: string[] = [];
    page.on("request", (request) => {
      if (request.url().includes("mahmud.webp")) photoRequests.push(request.url());
    });
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-lite", "auto");
    await expect(page.getByRole("status").filter({ hasText: "Slow internet detected" })).toBeVisible();

    const about = page.locator("#about");
    await about.scrollIntoViewIfNeeded();
    const show = about.getByRole("button", { name: /Show photo/ });
    await expect(show).toBeVisible();
    await expect(show).toContainText(/\d+ KB/);
    await expect(about.getByRole("img", { name: "Mahmud Faiezov with an eagle" })).toBeHidden();
    expect(photoRequests).toEqual([]);

    await show.click();
    await expect(about.getByRole("img", { name: "Mahmud Faiezov with an eagle" })).toBeVisible();
    await expect.poll(() => photoRequests.length).toBeGreaterThan(0);
  });

  test("'Show full version' turns it off and remembers that", async ({ page }) => {
    await slowConnection(page);
    await page.goto("/");
    await page.getByRole("button", { name: "Show full version" }).click();
    await expect(page.locator("html")).not.toHaveAttribute("data-lite", /.*/);
    await expect(page.getByText("Slow internet detected")).toBeHidden();
    await expect(page.locator("#about").getByRole("img", { name: "Mahmud Faiezov with an eagle" })).toBeAttached();

    await page.reload();
    await expect(page.locator("html")).not.toHaveAttribute("data-lite", /.*/);
  });

  test("the banner can be closed without leaving the light version", async ({ page }) => {
    await slowConnection(page);
    await page.goto("/");
    await page.getByRole("button", { name: "Close" }).click();
    await expect(page.getByText("Slow internet detected")).toBeHidden();
    await expect(page.locator("html")).toHaveAttribute("data-lite", "auto");
  });

  test("fast connections get the full version and no banner", async ({ page }) => {
    await slowConnection(page, "4g");
    await page.goto("/");
    await expect(page.locator("html")).not.toHaveAttribute("data-lite", /.*/);
    await expect(page.getByText("Slow internet detected")).toHaveCount(0);
  });

  test("the footer switch turns it on by hand", async ({ page }) => {
    await page.goto("/");
    const toggle = page.getByRole("contentinfo").getByRole("button", { name: "Light version" });
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    await toggle.click();
    await expect(page.locator("html")).toHaveAttribute("data-lite", "manual");
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    // Turned on by hand: no "slow internet detected" banner, because that would not be true.
    await expect(page.getByText("Slow internet detected")).toHaveCount(0);
    await toggle.click();
    await expect(page.locator("html")).not.toHaveAttribute("data-lite", /.*/);
  });

  test("lesson exercises load only when tapped", async ({ page }) => {
    await slowConnection(page);
    await page.goto("/blog/how-a-telegram-bot-works/");
    const load = page.getByRole("button", { name: "Load the exercise" }).first();
    await expect(load).toBeVisible();
    const before = await page.locator("[data-ready]").count();
    await load.click();
    await expect(page.locator("[data-ready=true]")).toHaveCount(before + 1);
  });

  test("the pipeline does not animate", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("lite", "on"));
    await page.goto("/");
    await page.waitForTimeout(3000);
    await expect(page.locator(".pipeline-packet")).toHaveCount(0);
  });
});

test.describe("head script position", () => {
  for (const path of ["/", "/ru/", "/tj/", "/tj/blog/how-a-telegram-bot-works/", "/tj/blog/websites-for-slow-internet/"]) {
    test(`runs before the stylesheet and hydrates without errors on ${path}`, async ({ page }) => {
      const errors: string[] = [];
      page.on("console", (message) => {
        // The test build points live stats at a local API that does not exist; that 404 is expected.
        if (message.type() === "error" && !message.text().startsWith("Failed to load resource")) errors.push(message.text());
      });
      page.on("pageerror", (error) => errors.push(error.message));
      await page.addInitScript(() => localStorage.setItem("theme", "dark"));
      await page.goto(path);
      const order = await page.evaluate(() => {
        const nodes = [...document.head.children];
        const script = nodes.findIndex((n) => n.tagName === "SCRIPT" && n.textContent?.includes("data-theme"));
        const css = nodes.findIndex((n) => n.matches('link[rel="stylesheet"]'));
        return { script, css };
      });
      expect(order.script).toBeGreaterThan(-1);
      expect(order.script).toBeLessThan(order.css);
      await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
      await page.waitForLoadState("networkidle");
      expect(errors).toEqual([]);
    });
  }
});
