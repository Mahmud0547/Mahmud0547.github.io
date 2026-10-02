---
title: "Where exchange rates come from — and how to build a site people can trust"
description: "Why every number needs a source and a date, the “10 KZT” trap that breaks converters, and how a site keeps working when its source goes down. With real official rates."
date: 2026-09-30
tags: Data, Cloudflare, Trust
series: how-it-works
lesson: 3
level: beginner
learn: who sets the official somoni rate and where a website gets it; why a number without a date and a source cannot be trusted; the “nominal” trap that makes converters wrong ten or a hundred times; how a site keeps showing correct data when its source is down
---
You want to know how many somoni your 100 dollars are worth. You open a website, it shows a number, and you believe it. But think for a second: **why** do you believe it? Who said that number is right? From which day is it?

This lesson is about trust: where numbers on a website come from, and the boring, careful decisions that make them worth believing. The example is Kursi Tojik — a site I built that shows the official exchange rates of the Tajik somoni.

## Who decides the rate?

Every working day, the **National Bank of Tajikistan** publishes the official rates: how many somoni one dollar, one euro, one ruble and other currencies cost. It puts them on its website, nbt.tj, also in a form that programs can read.

Commercial banks then set their own rates for buying and selling cash — usually a little different from the official one. The National Bank publishes those cash rates too.

So the honest answer to “where does the number come from?” is simple: **from the National Bank, on a specific date.** Kursi Tojik does not invent, estimate or type in any number. It copies what the bank publishes and says so.

## Rule one: every number has a source and a date

The first version of Kursi Tojik had a “money transfer fee calculator”. It looked useful and its tariffs looked real. But the data file behind it called them *illustrative* — examples, not real tariffs of real companies. It also had bank rates typed in by hand, which go out of date the next morning.

Both were removed. Not “improved” — removed. A feature that cannot point to a real, current source is worse than no feature, because people make money decisions with it.

> [!IDEA] A number without a date and a source is a rumour. Show where it came from and which day it belongs to — or don't show it.

## The nominal trap

Here is a mistake that is easy to make and hard to notice. For some currencies the bank does not publish the price of **one** unit, but of **ten** or **a hundred**. One Kazakh tenge or one Uzbek sum costs so little that the bank writes “10 KZT = …” or “100 UZS = …”. That number — 10 or 100 — is called the **nominal**.

If a converter forgets the nominal, it is wrong by ten or a hundred times. Try it with the real official rates of 2 October 2026:

{{demo:nominal}}

Kursi Tojik always divides by the nominal, and shows “10 KZT” on the board exactly as the bank publishes it — so you can compare it with the source yourself.

## When the source goes down

The first version asked the bank's website for the rates **on every visit**. That sounds fresh and simple. But when nbt.tj was slow or unavailable, Kursi Tojik showed… nothing. Or worse, it could show a zero.

So the site was rebuilt around its own notebook:

1. Every three hours, a scheduled job (a **cron** job — a timer on the server) visits nbt.tj and copies the new rates into a small database.
2. The website and the Telegram bot read **only from that database**, never from the bank directly.
3. If the bank's site is down, the database still has the last official rate — with its date.

Switch the bank off and compare the two approaches:

{{demo:outage}}

It is like a family that writes down the bus timetable once a day. If the bus company's website breaks, the family still knows when the bus comes — and knows the timetable is from this morning.

```text
nbt.tj ──(every 3 h)──▶ collector ──▶ database ◀── API ◀── website
                                              ◀── Telegram bot
```

> [!WARNING] Never show a zero or an empty table as if it were data. If something cannot be loaded, say so in plain words. A visible problem gets fixed; an invisible wrong number gets trusted.

## Small details that matter

- **“Best” in words, not only in colour.** The table of bank cash rates marks the best buying and selling rate with the word “best”. Some people cannot tell green from red; a word works for everyone.
- **The date is always on screen.** Not hidden in a tooltip — next to the numbers.
- **Three languages.** Tajik by default, plus Russian and English, because rates matter to everyone in the country and to people sending money from abroad.
- **The same trick as lesson 1.** The Kursi Tojik bot understands messages like “100 usd” — exactly the step-by-step reading you tried in the first lesson.

## Going deeper: how it is built

The whole service runs on **Cloudflare's** network:

- a **Worker** — a small program that runs on Cloudflare's servers around the world — serves the API and runs the scheduled collection;
- **D1** — a small SQLite database on the same network — stores rates, history and bank cash rates;
- the website is plain **TypeScript** without a framework, so it loads fast even on a weak mobile connection.

The conversion rule in the code is one line — and it is the line that the nominal trap is all about:

```ts
// api/src/money.ts — somoni for one unit
export const perUnit = (rate: Rate) => rate.value / rate.nominal;
```

Automatic tests run on every change, so a mistake like forgetting the nominal is caught by a test before any visitor sees it.

## The takeaway for any data product

Trust is mostly made of boring decisions:

1. **Name the source.** Every number, every time.
2. **Show the date.** Data is always “as of” some moment.
3. **Remove what you cannot prove.** Even if it looks nice.
4. **Fail loudly.** A clear “could not load” is better than a quiet wrong number.

This is true for exchange rates, prices in a shop, a clinic's schedule or a school's grades.

## Check yourself

```quiz
? Where does Kursi Tojik get the official somoni rates?
- It calculates them from bank websites
+ From the National Bank of Tajikistan, with the date it publishes them for
- From the average of what users enter
! The National Bank publishes the official rates. The site copies them and shows the source and date.

? The bank publishes “10 KZT = 0.2089 TJS”. How many somoni is 1000 tenge?
- 208.90
+ 20.89
- 2.089
! 1000 × 0.2089 ÷ 10 = 20.89. Forgetting the nominal makes the answer ten times too big.

? The bank's website is down. What should a good rates site show?
- A zero
- An empty page
+ The last official rate it saved, with its date
! Its own database still has the last official rate. Showing its date keeps it honest.

? Why was the “transfer fee calculator” removed?
+ Its tariffs were examples, not real current tariffs
- It was too slow
- Nobody used it
! A feature without a real source is worse than none, because people make money decisions with it.

? Why does the bank table say “best”, not only use green colour?
- Words look more modern
+ Some people cannot tell colours apart; a word works for everyone
- Colours are not allowed on websites
! Never put meaning only in colour. This is a basic rule of accessible design.
```

## Little dictionary

- **Official rate** — the rate the National Bank publishes for a date.
- **Cash rate** — the price at which a commercial bank buys or sells cash.
- **Nominal** — how many units of a currency a published rate is for (1, 10 or 100).
- **Source** — where a number comes from.
- **Cron job** — a task a server runs on a timetable, for example every three hours.
- **Database** — the site's organised notebook, where it keeps the data it collected.
- **Cache / saved copy** — data kept nearby so the site does not need to ask the source every time.

## Need numbers people can trust?

Prices, schedules, rates, reports — if your website or bot shows numbers, I can make them sourced, dated and reliable, in Tajik, Russian and English. Live example: [kursi-tojik.pages.dev](https://kursi-tojik.pages.dev). Write to me: [@SimorghDev](https://t.me/SimorghDev).
