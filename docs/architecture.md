# Architecture

```
Visitor
   │
   ▼
Cloudflare Pages ── static HTML/CSS/JS from `out/`
   │
   │  fetch (planned: two public endpoints)
   ▼
Simorgh API on Azure (FastAPI behind Caddy, HTTPS)
   ├── GET  /public/stats    → numbers for the live pipeline
   └── POST /public/contact  → validation → Telegram message to the owner
```

## Today

- The site is fully static. Every page in every language is rendered at build time.
- Pipeline numbers come from `content/stats-snapshot.json`, shown as "Updated <date>".
- The browser makes no requests to other origins: fonts are served from the site itself.

## Languages

| URL | `lang` / `hreflang` | Route |
|---|---|---|
| `/` | `en` | `app/(en)` |
| `/ru/` | `ru` | `app/[locale]` |
| `/tj/` | `tg` | `app/[locale]` |

The URL uses `tj` because clients recognise it; `tg` is the ISO 639-1 code search engines expect.
Each route group has its own root layout so that `<html lang>` is correct in the static HTML.

## Planned

Live stats and the contact form (with Cloudflare Turnstile) will call the Simorgh API. If the API is down, the site falls back to the build-time snapshot and never breaks.
