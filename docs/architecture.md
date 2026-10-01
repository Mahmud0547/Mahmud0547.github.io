# Architecture

```
Visitor
   │
   ▼
Cloudflare Pages ── static HTML/CSS/JS from `out/`
   │
   │  fetch from the browser
   ▼
Simorgh API on Azure (FastAPI behind Caddy, HTTPS)
   ├── GET  /public/stats    → numbers for the live pipeline
   └── POST /public/contact  → validation → Telegram message to the owner
```

## Pages

| Path | Content |
|---|---|
| `/` | Home: hero with the live pipeline, work, services, process, about, contact form |
| `/work/simorgh/` | Simorgh News case study |
| `/privacy/` | What the site and the form do with data |
| anything else | Branded 404 (`app/global-not-found.tsx`) |

Every page exists in English, Russian and Tajik and is rendered at build time.

## Build

```
npm run build
  prebuild   scripts/fetch-stats.mjs   refresh content/stats-snapshot.json from the API (keeps the old one on failure)
  build      next build                static export to out/
  postbuild  scripts/headers.mjs       out/_headers with CSP hashes for Cloudflare Pages
```

`npm run build:test` freezes the snapshot and points the API at the local test server, so end-to-end tests never touch the network.

## Live data and the form

- The pipeline first renders the snapshot ("Updated <date>"), then asks `GET /public/stats`.
  Only a valid answer switches it to "Live"; errors and malformed data keep the snapshot.
- The pipeline animates only when the visitor allows motion (`prefers-reduced-motion`).
- The contact form loads Cloudflare Turnstile only after the visitor focuses the form, so a page view alone contacts no third party.
- Configuration lives in `lib/config.ts` (`NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`).

## SEO

`lib/seo.ts` builds canonical URLs, `hreflang` links (`en`, `ru`, `tg`, `x-default`), Open Graph tags, the sitemap and JSON-LD
(`Person` and `ProfessionalService`). The link preview image `public/og.png` is rendered from `assets-src/og.html` with `npm run og`.

## Languages

| URL | `lang` / `hreflang` | Route |
|---|---|---|
| `/` | `en` | `app/(en)` |
| `/ru/` | `ru` | `app/[locale]` |
| `/tj/` | `tg` | `app/[locale]` |

The URL uses `tj` because clients recognise it; `tg` is the ISO 639-1 code search engines expect.
Each route group has its own root layout so that `<html lang>` is correct in the static HTML.
