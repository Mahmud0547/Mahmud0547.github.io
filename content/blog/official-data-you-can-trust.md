---
title: "Official data only: building a currency service people can trust"
description: Kursi Tojik shows the official somoni rates. What it took to make every number dated, sourced and available even when the source is down.
date: 2026-09-30
tags: Data, Cloudflare, Trust
---

Kursi Tojik shows today's official exchange rates of the Tajik somoni, a converter, a year of history and the cash rates of commercial banks. It is a small product, but money is a topic where people notice every mistake. This is what I changed when I rebuilt it.

## Rule one: every number has a source and a date

The first version had a money-transfer fee calculator. Its tariffs looked real, but the data file itself called them "illustrative". It also had bank rates typed in by hand.

Both are gone. Every number on the site now comes from the National Bank of Tajikistan, and the page always says which date it belongs to. A feature without a verifiable source was removed rather than "improved".

## Rule two: the site works when the source does not

The first version asked the bank's website for data on every visit. When that site was slow, Kursi Tojik was empty.

Now a scheduled job collects the data every three hours into a small database (Cloudflare D1, which is SQLite at the edge). The website and the Telegram bot read only from that database. If the bank's site is down, visitors still see the last official rate — with its date — instead of an error or, worse, a zero.

```text
nbt.tj ──(every 3 h)──▶ collector ──▶ database ◀── API ◀── website
                                              ◀── Telegram bot
```

## Small details that matter

- **Nominals.** The bank publishes some rates per 10 or 100 units (10 KZT, 100 UZS). The converter divides by the nominal, and the board shows "10 KZT", exactly as published.
- **Best bank rates in words.** The table marks the best buy and sell rates with the word "best", not only a colour.
- **No zeros, ever.** If data cannot be loaded, the page says so plainly.

## How it is built

TypeScript on Cloudflare Workers with Hono for the API, D1 for storage, a cron trigger for collection and a Telegram bot in the same worker. The website is plain TypeScript with no framework — about 8 KB of JavaScript — in Tajik, Russian and English, with a strict Content-Security-Policy. 77 API tests and 64 website tests run on every change.

## The takeaway

Trust is mostly made of boring decisions: show the date, name the source, remove what you cannot prove, and fail loudly instead of quietly showing wrong numbers.

Live: [kursi-tojik.pages.dev](https://kursi-tojik.pages.dev)
