---
title: "News does not sleep: 62% of it comes out after work hours"
description: "We counted when 1,498 news articles were published. Almost two thirds came out before 9:00 or after 18:00 Dubai time. Here is what a bot does with those hours."
date: 2026-10-06
tags: AI automation, Telegram bots, Case study
result: 62% of the news comes out after work hours · the bot covers all 24
---
A news channel has a quiet problem. The team works from morning to evening. The news does not.

We measured it on our own system. **Simorgh**, the AI newsroom we built, records the moment every article is published by its source. Here are the real numbers from its database.

## What we counted

From 29 September to 6 October 2026 Simorgh collected **1,498 articles** from BBC News and Al Jazeera. We grouped them by the hour they were published, in Dubai time, and compared them with a normal working day from **9:00 to 18:00**.

| When | Articles | Share |
|---|---|---|
| During work hours, 9:00–18:00 | 574 | 38% |
| Evening, 18:00–24:00 | 441 | 29% |
| Night and early morning, 0:00–9:00 | 483 | 32% |
| **Outside work hours in total** | **924** | **62%** |

The busiest hour of the whole day was **20:00** — when most teams have already gone home.

> [!IDEA] If you work from 9 to 6, almost two thirds of the news happens while you are not looking.

## See it for yourself

Every bar on the clock is one hour of the day; the longer the bar, the more news came out in that hour. Drag the ends of the yellow arc to your own working hours, switch between Dubai and Dushanbe, press **Live through a day**, then turn on the bot.

{{demo:night-clock}}

Try a common schedule, 10:00 to 19:00. Still more than half of the news falls outside it. Try to cover everything with people and you need a night shift.

## What this costs a channel

Without automation, every evening and every night ends the same way:

- **The morning starts with a backlog.** Hundreds of articles piled up overnight, and someone has to read them before the first post goes out.
- **Others post first.** The story broke at 20:00; a channel that posts at 9:30 the next morning is already late.
- **Or someone works nights.** A second editor for the evening shift costs a salary every month.

## What the bot does with those hours

Simorgh does not sleep. Every 30 minutes, day and night, it checks the sources and stores everything new. On request the AI writes drafts in Russian, and they wait for the editor in a web panel or right in Telegram.

So the editor's morning looks different: not hundreds of articles to read, but ready drafts to approve. When we measured on 3 October, half of the editor's decisions took **14 seconds or less**. Nothing is published without a person's “yes”.

## Not only for news

The same pattern fits any business whose work does not stop at 18:00:

- **Orders and bookings** that arrive in the evening wait in a tidy list instead of a messy chat.
- **Questions from customers** get an instant answer from your own information, and the hard ones are passed to you in the morning.
- **Prices, rates or competitors' news** are checked every 30 minutes, and a summary is ready when you start work.

Look at your own chats: if many messages arrive after your working day, the clock above is about your business too.

## The numbers, honestly

- The figures come from the Simorgh production database, read on 6 October 2026: 1,498 articles with a publication time from 29 September to 6 October.
- Work hours are counted as 9:00–18:00; the clock above lets you choose your own.
- This is news, not customer messages. For your business the share will be different — the clock shows how to think about it.

## See it working

The live numbers on the [home page](/) come from Simorgh, and the [first case study](/blog/automating-a-telegram-news-channel-with-ai/) shows how one person runs the channel with it. To understand how a bot answers from your own information, try [lesson 6 of the course](/blog/how-a-bot-answers-from-your-documents/).
