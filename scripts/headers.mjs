// Writes out/_headers for Cloudflare Pages: a strict Content-Security-Policy that allows
// exactly the inline scripts Next.js emitted (by SHA-256 hash), plus other security headers.
// `node scripts/headers.mjs --check` fails if any inline script in out/ is missing from the policy.
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const TURNSTILE = "https://challenges.cloudflare.com";
const LINE_LIMIT = 2000; // Cloudflare Pages ignores longer _headers lines.
const INLINE_SCRIPT = /<script(?![^>]*\ssrc=)(?![^>]*application\/ld\+json)[^>]*>([\s\S]*?)<\/script>/g;

export function inlineScriptHashes(html) {
  return [...html.matchAll(INLINE_SCRIPT)].map(([, body]) => `'sha256-${createHash("sha256").update(body).digest("base64")}'`);
}

export function buildHeaders({ scriptHashes, apiOrigin }) {
  const csp = [
    "default-src 'self'",
    `script-src 'self' ${[...scriptHashes, TURNSTILE].join(" ")}`,
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
  const lines = [
    "/*",
    `  Content-Security-Policy: ${csp};`,
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
  const longest = Math.max(...lines.map((line) => line.length));
  if (longest >= LINE_LIMIT) throw new Error(`_headers line is ${longest} characters; Cloudflare allows under ${LINE_LIMIT}`);
  return lines.join("\n");
}

export function missingHashes(html, headers) {
  return inlineScriptHashes(html).filter((hash) => !headers.includes(hash));
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
    const problems = files.flatMap((file) => missingHashes(readFileSync(file, "utf8"), headers).map((hash) => `${file}: ${hash}`));
    if (problems.length) {
      console.error(`Inline scripts missing from the CSP:\n${problems.join("\n")}`);
      process.exit(1);
    }
    console.log(`CSP covers every inline script in ${files.length} pages`);
    return;
  }
  const hashes = [...new Set(files.flatMap((file) => inlineScriptHashes(readFileSync(file, "utf8"))))].sort();
  const apiOrigin = new URL(process.env.NEXT_PUBLIC_API_URL ?? "https://9.205.154.67.sslip.io/api").origin;
  writeFileSync("out/_headers", buildHeaders({ scriptHashes: hashes, apiOrigin }));
  console.log(`out/_headers written: ${hashes.length} inline script hashes, API ${apiOrigin}`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) main();
