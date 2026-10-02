import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import { policyFor } from "../../scripts/headers.mjs";

// http-server cannot send headers, so attach the policy Cloudflare would send for each document's path.
const headers = readFileSync("out/_headers", "utf8");

async function withCsp(page: Page) {
  const violations: string[] = [];
  page.on("console", (message) => {
    if (/Content Security Policy|Refused to/i.test(message.text())) violations.push(message.text());
  });
  page.on("pageerror", (error) => violations.push(error.message));
  await page.route("http://localhost:4173/**", async (route) => {
    if (route.request().resourceType() !== "document") return route.fallback();
    const response = await route.fetch();
    const csp = policyFor(headers, new URL(route.request().url()).pathname);
    await route.fulfill({ response, headers: { ...response.headers(), "content-security-policy": csp } });
  });
  return violations;
}

for (const path of ["/", "/ru/", "/tj/work/simorgh/", "/privacy/", "/tj/blog/how-a-telegram-bot-works/", "/no-such-page/"]) {
  test(`${path} runs under the strict CSP`, async ({ page }) => {
    const violations = await withCsp(page);
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    // Hydration finished: client components respond.
    expect(violations).toEqual([]);
  });
}

test("live pipeline and contact form work under the CSP", async ({ page, isMobile }) => {
  test.skip(isMobile, "same code path on both projects");
  const violations = await withCsp(page);
  await page.route("**/public/stats", (route) =>
    route.fulfill({ json: { articles: 700, reviewed: 1, published: 1, latest: null, updated_at: "2026-10-02T08:00:00Z" } }),
  );
  await page.route("https://challenges.cloudflare.com/**", (route) =>
    route.fulfill({
      contentType: "text/javascript",
      body: 'window.turnstile = { render: (el, o) => { setTimeout(() => o.callback("t"), 10); return "w"; }, reset() {}, remove() {} };',
    }),
  );
  await page.route("**/public/contact", (route) => route.fulfill({ json: { ok: true } }));
  await page.goto("/");
  await expect(page.getByRole("region", { name: "Simorgh, my AI newsroom" })).toContainText("700 articles");
  const form = page.locator("#contact form");
  await form.getByLabel("Your name").fill("Jane");
  await form.getByLabel("Email").fill("jane@company.com");
  await form.getByLabel("What should the bot do?").fill("A bot that books tables for my cafe.");
  await form.getByRole("button", { name: "Send message" }).click();
  await expect(page.locator("#contact").getByRole("status")).toContainText("Thank you");
  expect(violations).toEqual([]);
});

test("the CSP really blocks foreign inline scripts", async ({ page }) => {
  const violations = await withCsp(page);
  await page.goto("/");
  await page.evaluate(() => {
    const script = document.createElement("script");
    script.textContent = "window.__injected = true";
    document.body.appendChild(script);
  });
  expect(await page.evaluate(() => (window as unknown as { __injected?: boolean }).__injected)).toBeUndefined();
  expect(violations.length).toBeGreaterThan(0);
});
