# 3. Source Serif 4 instead of Literata

Date: 2026-10-01 · Status: accepted

## Context
The first design used Literata for long-form text. Literata lacks eight Tajik Cyrillic letters, so Tajik pages would fall back to a system font mid-word.

## Decision
Use Source Serif 4 for long-form text and Onest for the interface. Both include the `cyrillic-ext` subset with all Tajik letters.

## Consequences
A browser test checks that both fonts ship the `cyrillic-ext` range, so a font change cannot silently break Tajik.
