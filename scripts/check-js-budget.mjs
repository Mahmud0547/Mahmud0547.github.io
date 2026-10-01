import { readFileSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";

const LIMIT = 200 * 1024; // Next.js App Router runtime is ~160 KB gzip; see docs/adr/0004-performance-budgets.md
const html = readFileSync("out/index.html", "utf8");
const sources = [...html.matchAll(/<script[^>]*\ssrc="([^"]+)"/g)].map((match) => match[1].split("?")[0]);

let total = 0;
for (const src of sources) {
  const size = gzipSync(readFileSync(join("out", src))).length;
  total += size;
  console.log(`${(size / 1024).toFixed(1).padStart(6)} KB  ${src}`);
}

const inline = [...html.matchAll(/<script(?![^>]*\ssrc=)[^>]*>([\s\S]*?)<\/script>/g)]
  .map((match) => gzipSync(match[1]).length)
  .reduce((sum, size) => sum + size, 0);

console.log(`Home JS files: ${(total / 1024).toFixed(1)} KB gzip (limit ${LIMIT / 1024} KB)`);
console.log(`Inline page data: ${(inline / 1024).toFixed(1)} KB gzip (not counted)`);
if (total > LIMIT) {
  console.error("JavaScript budget exceeded");
  process.exit(1);
}
