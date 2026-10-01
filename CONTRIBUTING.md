# Contributing

This guide is for developers who will change the site. Read [docs/architecture.md](docs/architecture.md) first for the big picture.

## Setup

Node.js 24 and npm.

```bash
npm install
npm run dev                      # http://localhost:3000
npx playwright install chromium  # once, for browser tests
```

## How the code is organised

- **Pages** are thin. `app/(en)/…/page.tsx` and `app/[locale]/…/page.tsx` only set metadata and render one component
  from `components/` (`HomePage`, `CaseStudy`, `PrivacyPage`). English lives at the root, other languages under `/ru/` and `/tj/`.
- **Texts** never live in components. Every visible string is in `messages/en.json`, `ru.json` and `tj.json`,
  with the same keys in all three (a unit test checks this). Placeholders look like `{count}` and are filled with `format()`.
- **Facts** that are not translated (links, prices, project data, tags) live in `content/site.ts`.
- **Server components by default.** Only `LivePipeline`, `ContactForm` and `MobileMenu` run in the browser.
  Client components import `lib/locale.ts`, never `lib/i18n.ts`, so the dictionaries of all languages are not shipped to visitors.
- **Configuration** is in `lib/config.ts` and can be overridden with `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SITE_URL`
  and `NEXT_PUBLIC_TURNSTILE_SITE_KEY`.
- **Styling** uses Tailwind with the brand tokens defined in `app/globals.css` (`deep`, `lapis`, `saffron`, …).
  Saffron is a fill colour only; saffron text on white fails contrast.

## Common changes

**Change a text.** Edit the key in all three files in `messages/`, then run `npm test`.

**Change a link or a price.** Edit `content/site.ts`. Tests in `tests/e2e/home.spec.ts` check the real URLs and prices; update them too.

**Add a page.**
1. Create `components/MyPage.tsx` that renders `<PageShell locale={locale} path="/my-page/">`.
2. Add `app/(en)/my-page/page.tsx` and `app/[locale]/my-page/page.tsx` (copy `privacy/` and change the names).
3. Add its texts to the three dictionaries.
4. Add the path to `sitePaths` in `lib/seo.ts` so it appears in the sitemap.
5. Add the path to the a11y and layout lists in `tests/e2e/` and write a small spec for it.

**Add a language.** Add the code to `locales` and `htmlLang` in `lib/locale.ts`, create `messages/<code>.json`
with every key, add the Open Graph locale in `lib/seo.ts`, and check that both fonts in `lib/fonts.ts` cover its alphabet.

**Change the live data or the form.** The API lives in the separate Simorgh repository. The site only reads
`GET /public/stats` (validated by `parseStats` in `lib/live-stats.ts`) and posts to `POST /public/contact`.

## Tests and budgets

```bash
npm run typecheck && npm run lint && npm test   # types, lint, unit tests
npm run build:test && npm run test:e2e          # browser tests on desktop and mobile
node scripts/check-js-budget.mjs                # home page JS must stay under 200 KB gzip
npx lhci autorun                                # Lighthouse thresholds from lighthouserc.json
```

`build:test` freezes the stats snapshot and points the API at the local test server, so browser tests never use the network.
Browser tests include axe accessibility checks and a test that loads every page under the real Content-Security-Policy.

If you add an inline script, nothing else is needed: `scripts/headers.mjs` adds its hash to the policy after each build,
and CI fails if a hash is missing.

## Commits and pull requests

- [Conventional Commits](https://www.conventionalcommits.org): `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`, `ci:`.
- One change per pull request; CI must be green.
- Record a lasting technical decision as a new file in `docs/adr/`.
- Add user-visible changes to `CHANGELOG.md`.

## Deploy

See the Deploy section of the [README](README.md). The old address `mahmud0547.github.io` is served from the
`legacy-redirect` branch, which only redirects to the new site; do not merge it into `main`.
