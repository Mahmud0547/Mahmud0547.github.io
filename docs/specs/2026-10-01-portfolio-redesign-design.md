# SimorghDev portfolio — design specification

**Date:** 2026-10-01
**Status:** approved 2026-10-01, implemented and launched 2026-10-01
**Mockups:** https://www.figma.com/design/BOuiP0pgPWP4uCtYquclVm (frames "Home — Desktop 1440" and "Home — Mobile 390")

---

## 1. Goal

A portfolio site that **gets attention, earns trust and brings orders** for "Telegram bots and AI automation", mainly from clients in the US and Europe.

**Success criteria:**
- within 10 seconds a visitor understands what I do and sees proof (the live Simorgh system);
- the path to an order is at most one click (Fiverr, Upwork, the form or Telegram);
- the site is found on Google for queries like "telegram bot developer" and "AI automation developer";
- Lighthouse on mobile: Accessibility, Best Practices and SEO at least 95, Performance at least 90 (adjusted 2026-10-01, see ADR 0004);
- the site makes no claim that cannot be verified (no invented numbers, reviews or clients).

## 2. Pages

| Path | Content |
|---|---|
| `/` | Home in English (the main language for clients) |
| `/ru/`, `/tj/` | Home in Russian and Tajik. URLs use `tj` (familiar to clients); `lang` and `hreflang` use `tg`, the ISO 639-1 code search engines expect |
| `/work/simorgh/` (+ `/ru/…`, `/tj/…`) | Simorgh case study: problem, architecture diagram, decisions, result, lessons learned |
| `/privacy/` | Privacy policy: what the form sends and where |
| `/404` | "Not found" page in the site's style |

Home sections (as in the mockup): header → hero with the live pipeline → trust strip → work → services → process → about → contact → footer.

A **blog** is out of scope for now. Content kept in the repository allows adding one later without a rewrite.

## 3. Design

The Figma mockups are the source of truth. Tokens:

| Token | Value | Role |
|---|---|---|
| `deep` | `#172A66` | background of the hero, process and contact sections |
| `lapis` | `#233C8C` | primary accent, buttons, links |
| `saffron` | `#E0A526` | main call to action, active pipeline step |
| `turquoise` | `#17807E` | check marks, "published" |
| `paper` / `white` | `#F3F4F7` / `#FFFFFF` | light sections |
| `ink` / `soft` | `#151827` / `#5B6072` | primary and secondary text |

**Fonts:** Onest (UI and headings) and Source Serif 4 (case study and About text). Both **support every Tajik letter** (ғ ӣ қ ӯ ҳ ҷ). Literata from the first mockup was replaced because it lacks eight Tajik letters.

**Motion:** one meaningful animation — a "news item" travels through the live pipeline step by step. No other automatic animation. With the system setting "reduce motion" (`prefers-reduced-motion`) the animation is off and the pipeline is static.

## 4. Architecture

```
Visitor
   │
   ▼
Cloudflare Pages  ── static HTML/CSS/JS (Next.js static export)
   │
   │  fetch (two public endpoints only)
   ▼
Simorgh API on Azure (FastAPI behind Caddy, HTTPS)
   ├── GET  /public/stats     → numbers for the live pipeline
   └── POST /public/contact   → validation → Telegram message to the owner
```

### 4.1 Site
- **Next.js 16 (App Router) + TypeScript (strict) + Tailwind CSS v4**, `output: 'export'`: the site is built into plain HTML pages. No server of our own means no server-side vulnerabilities and maximum speed.
- Texts in three languages live in dictionaries (`messages/en.json`, `ru.json`, `tj.json`); pages for each language are generated at build time.
- Fonts are loaded with `next/font` and **served from our own domain**: the visitor's browser never contacts Google Fonts.
- No third-party trackers. Visitor geolocation (ipapi.co on the old site) is **removed**.

### 4.2 Live pipeline (`GET /public/stats`)
A new public endpoint in the Simorgh API. It returns only safe aggregates:
```json
{ "articles": 558, "reviewed": 12, "published": 7,
  "latest": { "source": "BBC News", "title": "…" }, "updated_at": "…" }
```
- The answer is cached on the server for 60 seconds, so the site does not load the database.
- If the API is unavailable, the pipeline shows the numbers saved **at build time** and "Updated <date>" instead of "Live". The site never breaks because of the API.
- **Honesty:** the travelling news item illustrates the process; the numbers and the latest headline are real. The caption under the pipeline says exactly that.

### 4.3 Contact form (`POST /public/contact`)
Fields: name (up to 100 characters), email, message (20–2000 characters). Path: validation in the browser → validation on the server → Telegram message to the owner through the Simorgh bot. **Messages are not stored in the database.**

Spam and abuse protection — see section 5.

If sending fails, the form shows a clear error and a direct link to Telegram.

## 5. Security

### Site (headers via the Cloudflare Pages `_headers` file)
- **Content-Security-Policy**: scripts and styles only from our own domain and Cloudflare Turnstile; requests only to our API; the site cannot be embedded in other pages (`frame-ancestors 'none'`).
- **Strict-Transport-Security** (HTTPS only), **X-Content-Type-Options: nosniff**, **Referrer-Policy: strict-origin-when-cross-origin**, **Permissions-Policy** (camera, microphone and geolocation off).
- No secrets in the site's code: everything that reaches the browser is public.

### API
- **CORS**: public endpoints accept browser requests only from the portfolio domain.
- **Rate limits**: at most 5 messages per hour per IP; `stats` at most 60 requests per minute.
- **Cloudflare Turnstile** (a free "are you human" check without puzzles or tracking): the token is verified **on the server** with the secret key.
- **Honeypot**: a hidden field people never see; if it is filled in, the message is silently dropped.
- **Input validation** with Pydantic; the message text is escaped before it is sent to Telegram.
- Public endpoints give no access to drafts, the panel or moderation data.
- Security headers are also added by Caddy (API).

### Repository
- **Dependabot** — automatic dependency updates with security fixes.
- **CodeQL** (GitHub's free code analysis) and `npm audit` in CI.
- `SECURITY.md` — how to report a vulnerability.

## 6. SEO

- Unique `title` and `description` on every page and language.
- `hreflang` between language versions and `canonical` on every page.
- `sitemap.xml` and `robots.txt` generated at build time.
- Structured data (JSON-LD): `Person` and `ProfessionalService`, so Google understands who I am and what I offer.
- Link preview (Open Graph) image.
- Semantic markup: one `h1` per page and a correct heading hierarchy.
- Domain: launch on the Cloudflare Pages address (`*.pages.dev`), then a `.com` after the first order (about $11/year at Cloudflare or Porkbun). The site is ready for a domain change from day one. The old address `mahmud0547.github.io` redirects to the new one.

## 7. Accessibility

- Text contrast at least WCAG AA.
- All navigation and the form work with a keyboard, with a visible focus.
- `alt` on every meaningful image, labels on every form field.
- `prefers-reduced-motion` is respected.

## 8. Performance

- Home page JavaScript up to 200 KB gzip: Next.js itself takes about 160 KB (adjusted 2026-10-01, see ADR 0004).
- LCP (time until the main content appears) under 2 seconds on mobile.
- Images in WebP/AVIF with explicit sizes, lazy-loaded below the first screen.

## 9. Engineering standards

Repository layout:
```
app/            routes (App Router)
components/     UI components
content/        links, projects, prices, stats snapshot
messages/       en / ru / tj dictionaries
lib/            helpers (API calls, formatting, SEO)
public/         images and static files
scripts/        build and check scripts
docs/
  architecture.md       system diagram and data flows
  adr/                  architecture decision records (why it is built this way)
  specs/                design specifications
tests/          tests
```

- **README** — what it is, a screenshot, stack, how to run and deploy.
- **ADRs** — first records: "Static export instead of a server", "Cloudflare Pages instead of GitHub Pages", "Source Serif 4 instead of Literata".
- **SECURITY.md**, **CHANGELOG.md**, **LICENSE** (MIT for code; texts and photos all rights reserved).
- **Commits** follow Conventional Commits (`feat:`, `fix:`, `docs:`…).
- **CI (GitHub Actions)** on every change: type check, lint, tests (Vitest for helpers; Playwright for pages and the form), build, Lighthouse CI.
- **Previews**: a branch can be deployed to its own Cloudflare Pages address.

The same standards then apply to the Simorgh repository (a separate task).

## 10. What the owner provides

- [x] A **Cloudflare** account (free, no card) for hosting and Turnstile. Created 2026-09-19.
- [x] Links:
  - Telegram: https://t.me/Simorgh_Dev
  - LinkedIn: https://www.linkedin.com/in/mahmud-faiezov
  - Instagram: https://www.instagram.com/mahmud.simorghdev
  - Fiverr: https://www.fiverr.com/s/3A8051m
  - Upwork: https://www.upwork.com/freelancers/~01b20f000a77d7d8e3
  - GitHub: https://github.com/Mahmud0547
- [x] Sites for screenshots:
  - Kamarob Nature Fund: https://mahmud0547.github.io/kamarob-nature-fund/
  - Simorgh Dawn: https://mahmud0547.github.io/simorgh-dawn/
- [ ] Tajik translation: a draft is provided; the owner, a native speaker, does the final review.

## 11. Out of scope

Blog, CMS, visitor analytics, payments on the site, client accounts, reviews (they will appear after the first real orders).

## 12. Stages

1. Project skeleton, tokens, fonts, CI, documentation.
2. Home page from the mockup (desktop and mobile), three languages.
3. Public API endpoints (`stats`, `contact`) and their protection.
4. Live pipeline and contact form on the site.
5. Simorgh case study, privacy page, 404.
6. SEO, security headers, Lighthouse checks.
7. Launch on Cloudflare Pages and the redirect from the old address.
