import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

const site = "https://simorghdev.pages.dev";

for (const [path, lang] of [["/", "en"], ["/ru/", "ru"], ["/tj/work/simorgh/", "tg"], ["/privacy/", "en"]] as const) {
  test(`${path} has canonical, hreflang and Open Graph tags`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `${site}${path}`);
    const hreflangs = await page.locator('link[rel="alternate"][hreflang]').evaluateAll((links) => links.map((l) => l.getAttribute("hreflang")));
    expect(hreflangs.sort()).toEqual(["en", "ru", "tg", "x-default"]);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", `${site}/og.png`);
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute("content", `${site}${path}`);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /.{50,}/);
    await expect(page.locator("html")).toHaveAttribute("lang", lang);
  });
}

test("home page carries structured data", async ({ page }) => {
  await page.goto("/");
  const scripts = page.locator('script[type="application/ld+json"]');
  await expect(scripts).toHaveCount(1);
  const data = JSON.parse((await scripts.textContent()) ?? "{}");
  expect(data["@graph"].map((node: { "@type": string }) => node["@type"])).toEqual(["Person", "ProfessionalService"]);
});

test("sitemap lists every page and article, and robots points to it", () => {
  const sitemap = readFileSync("out/sitemap.xml", "utf8");
  expect([...sitemap.matchAll(/<loc>/g)]).toHaveLength(24);
  expect(sitemap).toContain(`<loc>${site}/tj/privacy/</loc>`);
  expect(readFileSync("out/robots.txt", "utf8")).toContain(`Sitemap: ${site}/sitemap.xml`);
});

test("the 404 page is not indexed", async ({ page }) => {
  await page.goto("/no-such-page/");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
});

test("Open Graph image is served", async ({ request }) => {
  const response = await request.get("/og.png");
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("image/png");
});
