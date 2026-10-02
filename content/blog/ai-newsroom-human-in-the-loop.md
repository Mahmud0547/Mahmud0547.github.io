---
title: An AI newsroom with a human in the loop
description: How Simorgh News turns world news into Telegram posts every day — and why a person still approves every single one.
date: 2026-10-02
tags: AI, Telegram, Automation
---

Running a news channel alone means reading dozens of sources and rewriting posts every day. It eats hours, and when you are busy, the channel goes quiet. Simorgh News is the system I built to fix that for my own channel. It has been running on a small cloud server since September 2026.

## The pipeline

Four steps, each one small and boring on purpose:

1. **Collect.** Every 30 minutes a scheduler reads RSS feeds from BBC and Al Jazeera and stores new articles in a database. Duplicates are rejected by a unique key, so the same story is never stored twice.
2. **Write.** A language model rewrites an English article into a Russian post in the channel's voice: a headline, the facts, a short comment and the source.
3. **Review.** The draft waits in a web panel and in a Telegram bot. The editor approves, edits or rejects it.
4. **Publish.** An approved post goes to the channel with one tap. Since this week the post shows a large preview of the source article above the text — the photo stays the publisher's and is shown with its source.

## Why a human approves every post

Language models are good at rewriting and bad at knowing when they are wrong. A newsroom that publishes on its own will, sooner or later, publish a mistake with full confidence. One tap from a person is cheap insurance.

The review step also changed how I write prompts. Instead of trying to make the model perfect, I made its output easy to check: short posts, the source always named, facts and opinion in separate paragraphs.

## Free models change — design for it

The system talks to any OpenAI-compatible API, and the model is a setting, not code. More than once a free model disappeared or started timing out. The fix was a fallback chain: if the first model is overloaded or answers with something that is not a Russian post, the next one in the list takes over.

One check turned out to matter more than expected: some models "think out loud" and send their reasoning in English instead of a post. A simple rule — at least half of the letters must be Cyrillic — rejects those answers automatically.

## What it runs on

- Python, FastAPI and SQLite for the API and the database
- aiogram for the Telegram bot
- Next.js for the moderation panel
- Docker Compose and Caddy (HTTPS) on one small Azure server

## What a business can take from this

The same pattern — collect, draft with AI, let a person approve, publish — works far beyond news: replies to customer questions, product descriptions, weekly reports, social posts. The automation does the slow part; a person keeps the judgement.

If you have a task like that, tell me about it: [@SimorghDev](https://t.me/SimorghDev).
