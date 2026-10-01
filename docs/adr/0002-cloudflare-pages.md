# 2. Cloudflare Pages instead of GitHub Pages

Date: 2026-10-01 · Status: accepted

## Context
GitHub Pages cannot set custom response headers, so a Content-Security-Policy and other security headers are impossible there. It also has no per-branch previews.

## Decision
Host on Cloudflare Pages (free plan).

## Consequences
- Security headers via a `_headers` file.
- A preview URL for every branch.
- Turnstile from the same account protects the contact form.
- The old `mahmud0547.github.io` address will redirect to the new one.
