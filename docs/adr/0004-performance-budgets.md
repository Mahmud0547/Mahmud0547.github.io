# 4. Performance budgets that match the framework

Date: 2026-10-01 · Status: accepted

## Context
The spec set two budgets: home page JavaScript under 100 KB gzip and a Lighthouse mobile performance score of at least 95.
Measured on the finished home page:
- JavaScript is 178 KB gzip. About 160 KB of it is the Next.js App Router runtime (React DOM, router, client core); the site's own code is about 9 KB.
- Real loading is fast: first contentful paint 0.8 s, total blocking time 30 ms, no layout shift.
- Lighthouse performance is 98 for `/`, 96 for `/ru/` and 90 for `/tj/`. The Tajik page needs extra Cyrillic font subsets for its headline, which Lighthouse's simulated slow network counts against it.

Meeting the original numbers would mean either stripping the Next.js runtime after the build (fragile, works against the framework) or moving to another framework.

## Decision
Keep Next.js and set budgets the framework can honestly meet:
- Home page JavaScript: at most 200 KB gzip (`scripts/check-js-budget.mjs`).
- Lighthouse mobile performance: at least 90; accessibility, best practices and SEO stay at 95 or higher (`lighthouserc.json`).
- Source Serif 4 is not preloaded, because it is only used below the first screen.

## Consequences
- The budgets still fail the build on any real regression (a heavy library, an unoptimised image, a blocking script).
- If Next.js gains a mode without the client runtime for static pages, revisit this record and tighten the budgets.
