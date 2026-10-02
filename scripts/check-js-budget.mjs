import { readFileSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";

const LIMIT = 200 * 1024; // Next.js App Router runtime is ~160 KB gzip; see docs/adr/0004-performance-budgets.md
// The home page, and a lesson — lessons carry the interactive demos, so they are the heaviest pages.
const PAGES = ["index.html", "blog/how-a-telegram-bot-works/index.html", "blog/access-rules-in-the-database/index.html"];

let failed = false;
for (const page of PAGES) {
  const html = readFileSync(join("out", page), "utf8");
  const sources = [...new Set([...html.matchAll(/<script[^>]*\ssrc="([^"]+)"/g)].map((match) => match[1].split("?")[0]))];
  const total = sources.reduce((sum, src) => sum + gzipSync(readFileSync(join("out", src))).length, 0);
  const inline = [...html.matchAll(/<script(?![^>]*\ssrc=)[^>]*>([\s\S]*?)<\/script>/g)]
    .map((match) => gzipSync(match[1]).length)
    .reduce((sum, size) => sum + size, 0);
  console.log(`${page}: JS files ${(total / 1024).toFixed(1)} KB gzip (limit ${LIMIT / 1024} KB), inline page data ${(inline / 1024).toFixed(1)} KB (not counted)`);
  if (total > LIMIT) failed = true;
}
if (failed) {
  console.error("JavaScript budget exceeded");
  process.exit(1);
}
