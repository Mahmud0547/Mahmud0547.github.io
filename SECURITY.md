# Security policy

If you find a vulnerability in this site, please report it privately via Telegram: https://t.me/Simorgh_Dev.
Do not open a public issue. I will reply within 72 hours and credit you once it is fixed, if you wish.

## How the site is protected

- **Static site.** No server code runs on the hosting side; there is nothing to log in to.
- **Content-Security-Policy.** `scripts/headers.mjs` runs after every build and writes `out/_headers` for Cloudflare Pages.
  Scripts may only come from the site itself, from Cloudflare Turnstile, or be one of the exact inline scripts
  Next.js generated (allowed by SHA-256 hash; no `'unsafe-inline'` for scripts). CI runs `node scripts/headers.mjs --check`
  and an end-to-end test that loads every page under the policy.
- **Other headers:** HSTS, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY` and `frame-ancestors 'none'`,
  a strict `Referrer-Policy` and a `Permissions-Policy` that turns off camera, microphone and location.
- **Contact form.** Messages go through the Simorgh API to the owner's Telegram and are not stored. The API checks a
  Cloudflare Turnstile token, has a hidden honeypot field, a rate limit per IP and a CORS allowlist.
- **Data from the API** is validated before display and rendered as text by React.
- **Dependencies** are checked by `npm audit` in CI, Dependabot and CodeQL.
