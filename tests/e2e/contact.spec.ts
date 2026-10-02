import { expect, test, type Page } from "@playwright/test";

const turnstileStub = `window.turnstile = {
  render: (el, options) => { window.__turnstileOptions = options; setTimeout(() => options.callback("test-token"), 50); return "widget"; },
  reset: () => { window.__turnstileResets = (window.__turnstileResets || 0) + 1; },
  remove: () => {},
};`;

test.beforeEach(async ({ page }) => {
  await page.route("https://challenges.cloudflare.com/**", (route) =>
    route.fulfill({ contentType: "text/javascript", body: turnstileStub }),
  );
});

async function fillForm(page: Page) {
  const form = page.locator("#contact form");
  await form.getByLabel("Your name").fill("Jane");
  await form.getByLabel("Email").fill("jane@company.com");
  await form.getByLabel("What should the bot do?").fill("A bot that books tables for my cafe.");
  return form;
}

test("sends the message and thanks the visitor", async ({ page }) => {
  const sent: unknown[] = [];
  await page.route("**/public/contact", async (route) => {
    sent.push(route.request().postDataJSON());
    await route.fulfill({ json: { ok: true } });
  });
  await page.goto("/");
  const form = await fillForm(page);
  await form.getByRole("button", { name: "Send message" }).click();
  await expect(page.locator("#contact").getByRole("status")).toContainText("Thank you");
  await expect(page.locator("#contact form")).toHaveCount(0);
  expect(sent).toEqual([
    { name: "Jane", email: "jane@company.com", message: "A bot that books tables for my cafe.", website: "", token: "test-token" },
  ]);
});

test("sends once on a double click", async ({ page }) => {
  let calls = 0;
  await page.route("**/public/contact", async (route) => {
    calls++;
    await new Promise((resolve) => setTimeout(resolve, 300));
    await route.fulfill({ json: { ok: true } });
  });
  await page.goto("/");
  const form = await fillForm(page);
  await form.getByRole("button", { name: "Send message" }).dblclick();
  await expect(page.locator("#contact").getByRole("status")).toContainText("Thank you");
  expect(calls).toBe(1);
});

test("shows a helpful error when the server fails", async ({ page }) => {
  await page.route("**/public/contact", (route) => route.fulfill({ status: 502, json: { detail: "x" } }));
  await page.goto("/");
  const form = await fillForm(page);
  await form.getByRole("button", { name: "Send message" }).click();
  const alert = page.locator("#contact").getByRole("alert");
  await expect(alert).toContainText("Could not send");
  await expect(alert.getByRole("link", { name: "Telegram" })).toHaveAttribute("href", "https://t.me/SimorghDev");
  await expect(form.getByRole("button", { name: "Send message" })).toBeEnabled();
  await expect.poll(() => page.evaluate(() => (window as unknown as { __turnstileResets?: number }).__turnstileResets)).toBe(1);
});

test("explains the rate limit", async ({ page }) => {
  await page.route("**/public/contact", (route) => route.fulfill({ status: 429, json: { detail: "x" } }));
  await page.goto("/");
  const form = await fillForm(page);
  await form.getByRole("button", { name: "Send message" }).click();
  await expect(page.locator("#contact").getByRole("alert")).toContainText("Too many messages");
});

test("shows an error when the network is down", async ({ page }) => {
  await page.route("**/public/contact", (route) => route.abort());
  await page.goto("/");
  const form = await fillForm(page);
  await form.getByRole("button", { name: "Send message" }).click();
  await expect(page.locator("#contact").getByRole("alert")).toContainText("Could not send");
});

test("validates in the browser before sending", async ({ page }) => {
  let calls = 0;
  await page.route("**/public/contact", (route) => {
    calls++;
    return route.fulfill({ json: { ok: true } });
  });
  await page.goto("/");
  const form = page.locator("#contact form");
  await form.getByLabel("Your name").fill("Jane");
  await form.getByLabel("Email").fill("not-an-email");
  await form.getByLabel("What should the bot do?").fill("too short");
  await form.getByRole("button", { name: "Send message" }).click();
  await page.waitForTimeout(300);
  expect(calls).toBe(0);
});

test("keeps the honeypot away from people", async ({ page }) => {
  await page.goto("/");
  const trap = page.locator('#contact input[name="website"]');
  await expect(trap).toBeHidden();
  await expect(trap).toHaveAttribute("tabindex", "-1");
  await expect(trap).toHaveAttribute("autocomplete", "off");
});

test("loads Turnstile only after the visitor starts typing", async ({ page }) => {
  const loads: string[] = [];
  page.on("request", (request) => {
    if (new URL(request.url()).hostname === "challenges.cloudflare.com") loads.push(request.url());
  });
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  expect(loads).toEqual([]);
  await page.locator("#contact form").getByLabel("Your name").focus();
  await expect.poll(() => loads.length).toBe(1);
  const options = await page.evaluate(() => (window as unknown as { __turnstileOptions: { sitekey: string } }).__turnstileOptions);
  expect(options.sitekey).toBe("0x4AAAAAAFLEMkH-Xwdvqv8J");
});

test("form is translated", async ({ page }) => {
  await page.goto("/ru/");
  const form = page.locator("#contact form");
  await expect(form.getByLabel("Ваше имя")).toBeVisible();
  await expect(form.getByRole("button", { name: "Отправить" })).toBeVisible();
  await expect(form.getByRole("link", { name: "Конфиденциальность" })).toHaveAttribute("href", "/ru/privacy/");
});
