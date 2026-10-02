// Moves the theme / light-version script (lib/preferences.ts headScript) to the top of <head> in every built page.
//
// Next.js renders it after the stylesheet <link>. An inline script after a stylesheet makes the parser wait for the
// CSS before reading on, which Lighthouse counts as ~0.5 s of extra LCP on slow connections. Right after
// <meta charset> it runs at once, still before the first paint. React 19 skips unexpected tags in <head> while
// hydrating, so the new position does not cause a mismatch (tests/e2e/preferences.spec.ts checks the console).
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const MARKER = '(function(){var d=document.documentElement;';
const CHARSET = '<meta charSet="utf-8"/>';

export function hoist(html) {
  const start = html.indexOf(`<script>${MARKER}`);
  if (start === -1) return html;
  const end = html.indexOf("</script>", start) + "</script>".length;
  const script = html.slice(start, end);
  const without = html.slice(0, start) + html.slice(end);
  const at = without.indexOf(CHARSET);
  if (at === -1) throw new Error("no <meta charset> to put the head script after");
  return without.slice(0, at + CHARSET.length) + script + without.slice(at + CHARSET.length);
}

function htmlFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return htmlFiles(path);
    return entry.name.endsWith(".html") ? [path] : [];
  });
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  let moved = 0;
  for (const file of htmlFiles("out")) {
    const html = readFileSync(file, "utf8");
    const next = hoist(html);
    if (next !== html) {
      writeFileSync(file, next);
      moved++;
    }
  }
  console.log(`head script moved to the top of <head> in ${moved} pages`);
}
