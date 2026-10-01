import { expect, test } from "@playwright/test";

test("home page is served from the static export", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page.locator("h1")).toHaveCount(1);
});

test("both site fonts cover Tajik Cyrillic letters", async ({ page }) => {
  await page.goto("/");
  const faces = await page.evaluate(async () => {
    await document.fonts.ready;
    const out: string[] = [];
    for (const sheet of Array.from(document.styleSheets)) {
      for (const rule of Array.from(sheet.cssRules)) {
        if (rule instanceof CSSFontFaceRule) {
          out.push(`${rule.style.getPropertyValue("font-family")}|${rule.style.getPropertyValue("unicode-range")}`);
        }
      }
    }
    return out;
  });
  const coversTajik = (face: string) => /U\+0?460-0?52F/i.test(face);
  expect(faces.some((f) => /onest/i.test(f) && coversTajik(f))).toBe(true);
  expect(faces.some((f) => /source.?serif/i.test(f) && coversTajik(f))).toBe(true);
});

test("page makes no requests to other origins", async ({ page, baseURL }) => {
  const foreign: string[] = [];
  page.on("request", (request) => {
    if (!request.url().startsWith(baseURL!)) foreign.push(request.url());
  });
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  expect(foreign).toEqual([]);
});

test("body uses the design tokens", async ({ page }) => {
  await page.goto("/");
  const body = await page.evaluate(() => {
    const style = getComputedStyle(document.body);
    return { color: style.color, background: style.backgroundColor };
  });
  expect(body.color).toBe("rgb(21, 24, 39)");
  expect(body.background).toBe("rgb(243, 244, 247)");
});

for (const [path, lang] of [["/", "en"], ["/ru/", "ru"], ["/tj/", "tg"]] as const) {
  test(`${path} is served with lang="${lang}"`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator("html")).toHaveAttribute("lang", lang);
  });
}

for (const path of ["/en/", "/tg/", "/de/"]) {
  test(`${path} is not a page`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(404);
  });
}
