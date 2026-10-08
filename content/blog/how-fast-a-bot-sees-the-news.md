---
title: "How fast does a bot see the news? We timed 1,797 articles"
description: "We timed 1,797 articles from publication to the moment our bot saved them. Median: 38 minutes. Where those minutes go, and how to make a channel faster."
date: 2026-10-08
tags: AI automation, Telegram bots, Case study
result: Median 38 min from publication to the bot · Al Jazeera 33 · BBC 49
hero: city
---
For a news channel, speed is the product. If a story broke an hour ago and your channel posts it now, readers have already seen it somewhere else.

So we measured how fast our own system notices the news. **Simorgh**, the AI newsroom we built, stores two times for every article: the time the source printed on it, and the moment Simorgh saved it. The difference is the delay.

## What we measured

From 30 September to 7 October 2026 Simorgh collected **1,797 articles** from BBC News and Al Jazeera. During that week the bot checked both sources **every 30 minutes**, day and night.

| | Median delay | Within 30 min | Within 1 hour | Over 3 hours |
|---|---|---|---|---|
| All articles | **38 min** | 670 (37%) | 1,262 (70%) | 302 (17%) |
| Al Jazeera | **33 min** | 295 (43%) | 665 (97%) | 0 |
| BBC News | **49 min** | 375 (34%) | 597 (54%) | 302 (27%) |

Half of all articles reached the bot within 38 minutes. Al Jazeera was fast and steady: almost every story arrived within an hour. BBC was split: many stories came quickly, but a quarter arrived more than three hours after their printed time.

## See the whole week in 3D

{{demo:delay-city}}

Switch the delay ranges on and off. The green rows (up to 30 minutes) are tall through the whole day. The orange row — over three hours — is the BBC's late stories, and it never disappears, at any hour.

## Where the minutes go

The delay has two parts.

**1. Waiting for the next check.** The bot looks every 30 minutes. A story that appears right after a check waits almost 30 minutes; one that appears just before waits seconds. On average it is **15 minutes** — that is simply how a schedule works.

**2. The source itself.** A story does not always appear in a source's feed at the moment printed on it. Our bot can add at most about half an hour. So when a story arrives three hours after its time, the rest of the wait happened at the source, before the bot could see it at all. The BBC's feed often lists stories hours after the time printed on them; Al Jazeera's feed did not do this once in the whole week.

> [!IDEA] Checking more often only shortens the first part. The second part depends on which sources you choose.

## Try a different schedule

{{demo:check-every}}

Checking every 5 minutes instead of 30 would cut the average wait from 15 minutes to 2.5. By our estimate, the median delay would drop from about 38 minutes to about 25. The cost is more requests: 576 checks a day instead of 96 — still nothing for a server.

## What this means for a channel

- **For most channels, 30 minutes is fine.** Readers of a daily news digest will not notice 15 minutes.
- **For breaking news, check more often** — every 5 minutes or even every minute. That is a one-line change in the bot's settings.
- **Choose fast sources.** No schedule can fix a feed that is three hours late. Al Jazeera delivered 97% of its stories within an hour.
- **Measure, don't guess.** A bot can record these times for any channel, and the numbers show exactly where the minutes go.

## The numbers, honestly

- The figures come from the Simorgh production database, read on 8 October 2026: 1,797 articles published from 30 September 06:00 to 8 October 00:00 UTC; the 3D chart uses Dubai time.
- The delay is the time Simorgh saved the article minus the time printed on it by the source.
- The 5-minute figure is an estimate: we kept the measured lag at the sources and changed only the wait for a check.

## See it working

The live numbers on the [home page](/) come from Simorgh. The [first case study](/blog/automating-a-telegram-news-channel-with-ai/) shows how one person runs a channel with it, and [the second](/blog/news-does-not-sleep/) shows when the news comes out. To see how a message travels between you and a bot, try [lesson 7 of the course](/blog/how-a-message-travels-around-the-world/).
