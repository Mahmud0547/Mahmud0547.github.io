// Writes out/_headers for Cloudflare Pages: a strict Content-Security-Policy that allows
// exactly the inline scripts Next.js emitted (by SHA-256 hash), plus other security headers.
//
// Every page carries its own inline script (its React Server Components payload), so one site-wide
// list of hashes outgrows Cloudflare's 2000-character line limit as pages are added. Instead each page
// gets its own rule with only its own hashes. The site-wide rule keeps a policy for pages without a
// rule of their own (the 404 page); page rules detach it ("! Content-Security-Policy") and set their own.
//
// `node scripts/headers.mjs --check` fails if any page's inline script is missing from the policy it is served with.
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { pathToFileURL } from "node:url";

const TURNSTILE = "https://challenges.cloudflare.com";
const LINE_LIMIT = 2000; // Cloudflare Pages ignores longer _headers lines.
const RULE_LIMIT = 100; // Cloudflare Pages reads at most 100 rules.
const INLINE_SCRIPT = /<script(?![^>]*\ssrc=)(?![^>]*application\/ld\+json)[^>]*>([\s\S]*?)<\/script>/g;

export function inlineScriptHashes(html) {
  return [...html.matchAll(INLINE_SCRIPT)].map(([, body]) => `'sha256-${createHash("sha256").update(body).digest("base64")}'`);
}

export function policy(scriptHashes, apiOrigin) {
  return [
    "default-src 'self'",
    `script-src 'self' ${[...new Set(scriptHashes), TURNSTILE].join(" ")}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    `connect-src 'self' ${apiOrigin}`,
    `frame-src ${TURNSTILE}`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join("; ");
}

/**
 * @param {{ fallbackHashes: string[], pages: { path: string, scriptHashes: string[] }[], apiOrigin: string }} input
 */
export function buildHeaders({ fallbackHashes, pages, apiOrigin }) {
  const lines = [
    "/*",
    `  Content-Security-Policy: ${policy(fallbackHashes, apiOrigin)};`,
    "  Strict-Transport-Security: max-age=31536000; includeSubDomains",
    "  X-Content-Type-Options: nosniff",
    "  X-Frame-Options: DENY",
    "  Referrer-Policy: strict-origin-when-cross-origin",
    "  Permissions-Policy: camera=(), microphone=(), geolocation=()",
    "",
    "/_next/static/*",
    "  Cache-Control: public, max-age=31536000, immutable",
    "",
  ];
  for (const page of pages) {
    lines.push(page.path, "  ! Content-Security-Policy", `  Content-Security-Policy: ${policy(page.scriptHashes, apiOrigin)};`, "");
  }
  const rules = 2 + pages.length;
  if (rules > RULE_LIMIT) throw new Error(`_headers has ${rules} rules; Cloudflare reads at most ${RULE_LIMIT}`);
  const longest = Math.max(...lines.map((line) => line.length));
  if (longest >= LINE_LIMIT) throw new Error(`_headers line is ${longest} characters; Cloudflare allows under ${LINE_LIMIT}`);
  return lines.join("\n");
}

/** The Content-Security-Policy a URL path is served with: its own rule, or the site-wide one. */
export function policyFor(headers, path) {
  const blocks = headers.split("\n\n").map((block) => block.split("\n"));
  const own = blocks.find((lines) => lines[0] === path);
  const site = blocks.find((lines) => lines[0] === "/*");
  const line = (own ?? site)?.find((l) => l.startsWith("  Content-Security-Policy:"));
  return line ? line.slice("  Content-Security-Policy: ".length) : "";
}

export function missingHashes(html, csp) {
  return inlineScriptHashes(html).filter((hash) => !csp.includes(hash));
}

/** out/blog/x/index.html → /blog/x/ ; out/404.html → null (served for unknown paths, covered by the site-wide rule). */
export function urlPath(file, root = "out") {
  const rel = relative(root, file).split(sep).join("/");
  if (rel.endsWith("/index.html")) return `/${rel.slice(0, -"index.html".length)}`;
  if (rel === "index.html") return "/";
  return null;
}

function htmlFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return htmlFiles(path);
    return entry.name.endsWith(".html") ? [path] : [];
  });
}

function main() {
  const files = htmlFiles("out");
  if (process.argv.includes("--check")) {
    const headers = readFileSync("out/_headers", "utf8");
    const problems = files.flatMap((file) => {
      const csp = policyFor(headers, urlPath(file) ?? "/*");
      return missingHashes(readFileSync(file, "utf8"), csp).map((hash) => `${file}: ${hash}`);
    });
    if (problems.length) {
      console.error(`Inline scripts missing from the CSP:\n${problems.join("\n")}`);
      process.exit(1);
    }
    console.log(`CSP covers every inline script in ${files.length} pages`);
    return;
  }
  const apiOrigin = new URL(process.env.NEXT_PUBLIC_API_URL ?? "https://9.205.154.67.sslip.io/api").origin;
  const pages = [];
  const fallbackHashes = [];
  for (const file of files.sort()) {
    const hashes = inlineScriptHashes(readFileSync(file, "utf8"));
    const path = urlPath(file);
    if (path && !path.startsWith("/404/") && !path.startsWith("/_not-found/")) pages.push({ path, scriptHashes: hashes });
    else fallbackHashes.push(...hashes);
  }
  writeFileSync("out/_headers", buildHeaders({ fallbackHashes, pages, apiOrigin }));
  console.log(`out/_headers written: ${pages.length} page rules, API ${apiOrigin}`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) main();
