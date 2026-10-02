---
title: "One person and an AI bot run a news channel: how we automated a Telegram newsroom"
description: "A news channel used to need people reading sources all day. Our AI bot read 956 articles and drafted the posts; a person only approves. Real numbers inside."
date: 2026-10-03
tags: AI automation, Telegram bots, Case study
result: 956 articles read by the bot · publishing takes one tap
---
Every business has a job that someone does again and again: reads the same kind of messages, copies the same kind of data, writes the same kind of text. It is never urgent enough to fix, so it quietly eats hours every single day.

For a news channel that job is the whole business. This article shows how we took it off a person's hands with an AI bot — with the real numbers from the server where it runs — and how the same idea works for your routine.

## How a news channel works by hand

To run a Telegram news channel the usual way, someone has to:

1. **Watch the sources** — open BBC, Al Jazeera and other sites again and again, because news does not wait.
2. **Choose** what is worth posting.
3. **Write the post** — retell a long English article in short, clear Russian.
4. **Check** names, numbers and dates.
5. **Publish** — and do it all again in an hour, including evenings and weekends.

That is a full-time job for at least one person. Most small channels and businesses cannot pay for it, so the channel goes quiet on busy days and the audience drifts away.

## What the bot does now

We built **Simorgh News**: an AI system that does steps 1 to 3 by itself and leaves a person only the decision. Here is what it has done since it went live on a cloud server on 29 September 2026, as of 3 October:

| What | By whom | Real number |
|---|---|---|
| Checking the news sources | the bot, every 30 minutes, day and night | 48 times a day |
| Reading and storing articles | the bot | **956 articles** |
| Writing drafts in Russian | the bot, with an AI model | on request |
| Checking drafts | a person, in the web panel or in Telegram | 16 drafts |
| Publishing | a person, one tap | 9 posts |

Look at the last two lines. The person checked 16 drafts and published 9 — **7 were rejected**. That is not a weakness, it is the point: the AI does the heavy work, and nothing reaches the readers without a human “yes”.

> [!IDEA] The bot does not replace the editor. It replaces the part of the editor's day that nobody enjoys: watching, reading and rewriting. The person keeps the part that needs judgement.

## What changed for the person

Before, the work was hours of reading and writing. Now it is a few seconds per post: open the draft, compare it with the source the panel shows next to it, tap **Approve**, **Edit** or **Reject**.

How many hours is that? Here is a simple estimate — not a measurement: if a person spent **just one minute** looking at each of the 956 articles the bot read, that alone would be about **16 hours** of work. Writing a post by hand takes much longer than approving one. The bot did all of that reading without anyone sitting at a screen.

And it keeps working while the person sleeps: the sources are checked 48 times a day, so the morning starts with fresh drafts waiting.

## What it costs to run

- **Server:** one small cloud machine runs everything — the bot, the database, the web panel. Ours runs on a student plan at no cost; at normal prices a server of this size costs under ten dollars a month.
- **AI:** the system can use any of several AI providers and switches to the next one if a model is busy. Which model is used is a setting, not code, so the cost can be kept low or even at zero with free models.
- **People:** one person, a few minutes a day.

## Count your own routine

Pick a task similar to one your team does every day, or set your own numbers.

{{demo:routine}}

The examples are typical tasks, not measurements — your numbers are what matter. If the result shows hours, that is time your team is paying for today.

## The same idea works far beyond news

The pattern behind Simorgh is simple: **the bot collects → the AI prepares → a person approves → the bot delivers**. It fits many businesses:

- **A shop or a café:** a Telegram bot answers questions about prices, opening hours and delivery, and passes anything unusual to a person.
- **Orders and bookings:** the bot takes the order in a chat and writes it into your table or system — no copying by hand.
- **Monitoring:** prices, exchange rates, competitors' news or job posts checked every 30 minutes, with a short summary in your Telegram.
- **Reports:** the AI drafts the weekly report from your data; a manager reads and sends it.
- **Content:** posts for your channel or website drafted from your own news and approved by you.

## “But…” — honest answers

**“AI makes mistakes.”** Yes. That is why nothing is published without a person. In Simorgh, 7 of 16 drafts were rejected — the check works. An automatic test also throws away answers in the wrong language before a person ever sees them.

**“It sounds expensive.”** Bots start at $50 for a simple one; a bot with a database is $140; a full system with a web panel and a server is $320. You see the price before you start, and payment is held by Fiverr or Upwork until you accept the work.

**“What about my data?”** Access rules live in the database itself, not only in the app — we explain why in [lesson 4 of the course](/blog/access-rules-in-the-database/).

**“My customers speak Tajik or Russian.”** Our bots and sites work in Tajik, Russian and English.

## See it working

The numbers on the [home page](/) come live from the Simorgh server, and the [case study](/work/simorgh/) shows how the system is built. If you want to understand every step, [lesson 2 of the course](/blog/ai-newsroom-human-in-the-loop/) lets you be the editor yourself.
