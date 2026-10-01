# SimorghDev portfolio

Portfolio of Mahmud Faiezov: Telegram bots and AI automation. Live at **https://simorghdev.pages.dev**.

![Home page](docs/screenshot.webp)

- Three languages: English (`/`), Russian (`/ru/`), Tajik (`/tj/`).
- A live pipeline with real numbers from the Simorgh News production API.
- A contact form that delivers messages straight to Telegram, protected by Cloudflare Turnstile.
- A static site with a strict Content-Security-Policy, tested on desktop and mobile.

## Stack

Next.js 16 (App Router, static export) · TypeScript · Tailwind CSS 4 · Vitest · Playwright · axe · Lighthouse CI · Cloudflare Pages

## Run locally

```bash
npm install
npm run dev          # http://localhost:3000
```

## Check

```bash
npm run typecheck && npm run lint && npm test
npm run build:test && npm run test:e2e
node scripts/check-js-budget.mjs
npx lhci autorun
```

## Deploy

```bash
npm run build                              # refreshes the stats snapshot, builds out/ and writes out/_headers
git checkout content/stats-snapshot.json   # keep the snapshot the tests expect
npx wrangler pages deploy out --project-name simorghdev --branch main
```

Use `--branch <name>` instead of `main` for a preview at `<name>.simorghdev.pages.dev`.

## Structure

| Path | What |
|---|---|
| `app/` | routes: `(en)` for English, `[locale]` for `/ru/` and `/tj/` |
| `components/` | page sections and UI |
| `content/` | links, projects, skills, prices, stats snapshot |
| `messages/` | EN / RU / TJ dictionaries |
| `lib/` | config, i18n, formatting, live stats, SEO, Turnstile |
| `scripts/` | build steps and checks |
| `tests/` | unit (`unit/`) and browser (`e2e/`) tests |
| `docs/` | architecture, decisions (ADR) and the design spec |

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to change texts, add pages or languages.

## License

Code: MIT. Texts and photos: all rights reserved. See [LICENSE](LICENSE).
