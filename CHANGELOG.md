# Changelog

All notable changes to this project are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added
- Next.js static site replacing the old single-page portfolio.
- Home page in English, Russian and Tajik (`/`, `/ru/`, `/tj/`).
- Self-hosted Onest and Source Serif 4 fonts with Tajik letter support.
- CI: type check, lint, unit and browser tests, JavaScript budget, Lighthouse.
- Performance budgets matched to the Next.js runtime (ADR 0004).
- Dark theme with a switcher: Light, Same as the device, Dark; remembered in the browser and applied before the first paint.
- Light version for slow internet: switches on by itself on 2G/3G or data saver, turns off motion, and loads photos and lesson exercises only on tap.
- Lesson 5 of “How it works”: a website for slow internet, with a load-time simulator built on this site's real page sizes, in English, Russian and Tajik.

### Removed
- Visitor geolocation via ipapi.co and Google Fonts requests.
