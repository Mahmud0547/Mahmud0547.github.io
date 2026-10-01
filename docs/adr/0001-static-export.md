# 1. Static export instead of a server

Date: 2026-10-01 · Status: accepted

## Context
The portfolio has a few pages that change only when the owner edits them. The two dynamic features (live stats, contact form) are served by the existing Simorgh API.

## Decision
Build with Next.js `output: 'export'` and serve plain files.

## Consequences
- No server to patch or attack; pages load from a CDN.
- No Next.js server features (middleware, ISR, route handlers). Language routing is done with route groups at build time.
- Dynamic data must come from the Simorgh API at runtime, with a build-time fallback.
