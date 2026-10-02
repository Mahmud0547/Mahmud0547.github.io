import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { buildHeaders, inlineScriptHashes, missingHashes, policyFor, urlPath } from "@/scripts/headers.mjs";

const sha = (text: string) => `'sha256-${createHash("sha256").update(text).digest("base64")}'`;

describe("inlineScriptHashes", () => {
  it("hashes inline scripts and skips external and JSON-LD ones", () => {
    const html = `<head><script src="/a.js"></script><script>self.a=1</script></head>
      <body><script type="application/ld+json">{"@type":"Person"}</script><script id="x">self.b=2</script></body>`;
    expect(inlineScriptHashes(html)).toEqual([sha("self.a=1"), sha("self.b=2")]);
  });
});

describe("buildHeaders", () => {
  const text = buildHeaders({ fallbackHashes: ["'sha256-abc'"], pages: [], apiOrigin: "https://api.example" });
  const csp = text.split("\n").find((line) => line.includes("Content-Security-Policy"))!;

  it("allows only own scripts, the hashed inline ones and Turnstile", () => {
    expect(csp).toContain("script-src 'self' 'sha256-abc' https://challenges.cloudflare.com;");
    expect(csp).not.toMatch(/script-src[^;]*unsafe-inline/);
  });

  it.each([
    "default-src 'self'",
    "connect-src 'self' https://api.example",
    "frame-src https://challenges.cloudflare.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "img-src 'self' data:",
    "font-src 'self'",
    "style-src 'self' 'unsafe-inline'",
  ])("sets %s", (directive) => {
    expect(csp).toContain(directive);
  });

  it.each([
    "Strict-Transport-Security: max-age=31536000; includeSubDomains",
    "X-Content-Type-Options: nosniff",
    "X-Frame-Options: DENY",
    "Referrer-Policy: strict-origin-when-cross-origin",
    "Permissions-Policy: camera=(), microphone=(), geolocation=()",
  ])("sends %s", (header) => {
    expect(text).toContain(header);
  });

  it("caches hashed build assets forever", () => {
    expect(text).toMatch(/\/_next\/static\/\*\n {2}Cache-Control: public, max-age=31536000, immutable/);
  });

  it("refuses a policy longer than the Cloudflare line limit instead of truncating it", () => {
    const many = Array.from({ length: 40 }, (_, i) => `'sha256-${String(i).padStart(44, "x")}'`);
    expect(() => buildHeaders({ fallbackHashes: many, pages: [], apiOrigin: "https://api.example" })).toThrow(/2000/);
  });

  it("refuses more rules than Cloudflare reads", () => {
    const pages = Array.from({ length: 99 }, (_, i) => ({ path: `/p${i}/`, scriptHashes: [] }));
    expect(() => buildHeaders({ fallbackHashes: [], pages, apiOrigin: "https://api.example" })).toThrow(/100/);
  });
});

describe("per-page policies", () => {
  const headers = buildHeaders({
    fallbackHashes: ["'sha256-boot'", "'sha256-404'"],
    pages: [{ path: "/blog/x/", scriptHashes: ["'sha256-boot'", "'sha256-x'"] }],
    apiOrigin: "https://api.example",
  });

  it("gives a page its own policy that replaces the site-wide one", () => {
    expect(headers).toContain("/blog/x/\n  ! Content-Security-Policy\n  Content-Security-Policy: ");
    expect(policyFor(headers, "/blog/x/")).toContain("'sha256-x'");
    expect(policyFor(headers, "/blog/x/")).not.toContain("'sha256-404'");
  });

  it("uses the site-wide policy for paths without a rule", () => {
    expect(policyFor(headers, "/missing/")).toContain("'sha256-404'");
    expect(policyFor(headers, "/missing/")).not.toContain("'sha256-x'");
  });

  it("maps built files to the paths they are served at", () => {
    expect(urlPath("out/index.html")).toBe("/");
    expect(urlPath("out/tj/blog/x/index.html")).toBe("/tj/blog/x/");
    expect(urlPath("out/404.html")).toBeNull();
  });
});

describe("missingHashes", () => {
  it("reports inline scripts whose hash is not in the policy", () => {
    const csp = buildHeaders({ fallbackHashes: [sha("self.a=1")], pages: [], apiOrigin: "https://api.example" });
    expect(missingHashes("<script>self.a=1</script><script>self.c=3</script>", csp)).toEqual([sha("self.c=3")]);
  });
});
