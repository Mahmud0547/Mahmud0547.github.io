// Renders a link-preview image (1200×630) for every blog article in every language it is written in:
// public/og/blog/<lang>-<slug>.png. Telegram, Facebook and others show it when a lesson link is shared.
// Run after adding or renaming an article: npm run og:lessons
import { chromium } from "@playwright/test";
import { mkdirSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const extra = {
  en: { interactive: "Interactive lesson · try it on the page", by: "Mahmud Faiezov · SimorghDev" },
  ru: { interactive: "Интерактивный урок · пробуйте прямо на странице", by: "Махмуд Файзов · SimorghDev" },
  tj: { interactive: "Дарси интерактивӣ · дар худи саҳифа санҷед", by: "Маҳмуд Файзов · SimorghDev" },
};

function frontMatter(source) {
  const block = /^---\n([\s\S]*?)\n---/.exec(source.replace(/\r\n/g, "\n"))[1];
  return Object.fromEntries(
    block.split("\n").map((line) => {
      const i = line.indexOf(":");
      return [line.slice(0, i).trim(), line.slice(i + 1).trim().replace(/^"(.*)"$/, "$1")];
    }),
  );
}

const escape = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const format = (t, vars) => t.replace(/\{(\w+)\}/g, (_, k) => String(vars[k]));

const files = readdirSync("content/blog").filter((f) => f.endsWith(".md"));
const articles = files.map((file) => {
  const [, slug, lang = "en"] = /^([a-z0-9-]+?)(?:\.(ru|tj))?\.md$/.exec(file);
  return { slug, lang, meta: frontMatter(readFileSync(join("content/blog", file), "utf8")) };
});
const lessonsIn = (series) => new Set(articles.filter((a) => a.meta.series === series).map((a) => a.slug)).size;

function html({ lang, meta }) {
  const t = JSON.parse(readFileSync(`messages/${lang}.json`, "utf8")).blog;
  const course = meta.series
    ? `${t.series[meta.series]} · ${format(t.lesson, { n: meta.lesson, total: lessonsIn(meta.series) })}`
    : t.title;
  const size = meta.title.length > 80 ? 54 : meta.title.length > 60 ? 62 : 70;
  const mark = `data:image/svg+xml;base64,${readFileSync("public/brand/mark.svg").toString("base64")}`;
  return `<!doctype html><html lang="${lang === "tj" ? "tg" : lang}"><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Onest:wght@500;700;800&display=block&subset=cyrillic-ext" rel="stylesheet">
<style>
  * { margin: 0; box-sizing: border-box; }
  body { width: 1200px; height: 630px; background: #172A66; color: #fff; font-family: Onest, sans-serif; padding: 64px 80px; display: flex; flex-direction: column; justify-content: space-between; overflow: hidden; position: relative; }
  .top { display: flex; align-items: center; justify-content: space-between; }
  .brand { display: flex; align-items: center; gap: 14px; font-size: 28px; font-weight: 700; }
  .brand img { width: 40px; height: 40px; }
  .course { background: #233C8C; color: #E0A526; font-size: 24px; font-weight: 700; padding: 10px 22px; border-radius: 999px; }
  h1 { font-size: ${size}px; line-height: 1.06; letter-spacing: -0.03em; font-weight: 800; max-width: 1000px; }
  .foot { display: flex; align-items: center; justify-content: space-between; gap: 24px; font-size: 24px; color: #C9D2EE; font-weight: 500; }
  .chip { background: #E0A526; color: #151827; font-weight: 700; padding: 12px 22px; border-radius: 14px; }
  .glow { position: absolute; right: -160px; bottom: -200px; width: 560px; height: 560px; border-radius: 50%; background: #1F3479; z-index: -1; }
</style></head><body>
  <div class="glow"></div>
  <div class="top"><div class="brand"><img src="${mark}" alt="">SimorghDev</div><div class="course">${escape(course)}</div></div>
  <h1>${escape(meta.title)}</h1>
  <div class="foot"><span>${escape(extra[lang].by)}</span><span class="chip">${escape(extra[lang].interactive)}</span></div>
</body></html>`;
}

mkdirSync("public/og/blog", { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
for (const article of articles) {
  await page.setContent(html(article), { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  const path = `public/og/blog/${article.lang}-${article.slug}.png`;
  await page.screenshot({ path });
  console.log(`${path} written`);
}
await browser.close();
