---
title: "How an AI newsroom works — and why a person still has the last word"
description: "Follow world news from a feed to a Telegram post, be the editor yourself, and see the simple checks that stop an AI from publishing nonsense."
date: 2026-10-02
tags: AI, Telegram, Automation
series: how-it-works
lesson: 2
level: beginner
learn: what an AI language model really does — and why it can be confidently wrong; the four steps of an automatic newsroom; why a person approves every post, and try being that person; two simple checks that catch the model's mistakes before anyone sees them
---
Running a news channel alone means reading dozens of sources and rewriting posts every day. It eats hours, and on busy days the channel goes quiet. So I built Simorgh News: a system that reads world news, writes posts with the help of AI and sends them to my Telegram channel. It has been running on a small cloud server since September 2026.

But there is one rule in it that never changes: **no post goes out until a person presses “Approve”.** This lesson explains how the whole thing works — and why that one button matters more than all the clever parts.

## First: what is an AI model, really?

Your phone's keyboard suggests the next word as you type. Type “Good” and it offers “morning”. It learned that from millions of messages.

An AI language model is the same idea, made enormous. It has read a huge part of the internet and learned which words usually follow which. Ask it to rewrite a news article, and it writes, word by word, the text that most likely fits.

That makes it very good at **writing** — smooth sentences, the right tone, in seconds. But notice what it does *not* do: it does not check facts. It does not know whether 12 or 120 houses were flooded. It produces what *sounds* right. Most of the time that is also what *is* right. Sometimes it is not — and the model sounds just as sure either way.

> [!IDEA] An AI model is like a very fast intern who writes beautifully but sometimes, with full confidence, gets a fact wrong. You would not let an intern publish alone on day one. Neither do I.

## The four steps

The newsroom is a chain of four small steps. Each one is boring on purpose — boring is easy to check.

1. **Collect.** Every 30 minutes a timer wakes up a collector. It reads the news feeds of BBC and Al Jazeera — feeds are lists of fresh headlines that news sites publish for programs to read (this is called RSS). New articles go into a database. Every article has its own web address, and the database refuses to store the same address twice, so a story never appears two times.
2. **Write.** The AI model gets one English article and instructions: write a short Russian post in the channel's voice — a headline, the facts, a short comment and the source.
3. **Review.** The draft waits in a web panel and in a Telegram bot. The editor — me — reads it and presses **Approve**, **Edit** or **Reject**.
4. **Publish.** An approved post goes to the channel with one tap.

It is like a small kitchen: a delivery person brings ingredients every half hour, a fast cook prepares the dish, the head chef tastes it, and only then the waiter takes it out.

## You are the editor

Now it is your turn. Below are three drafts “written by the AI”, each next to its source. The news is invented for this exercise, but the kinds of mistakes are real. Decide: approve or reject?

{{demo:editor}}

Did you catch the extra zero? That is exactly the kind of mistake that is easy for a model to make and easy for a person to see — **if the person looks**. The third draft is sneakier: nothing in it is a clear number mistake, but it turns one bakery's 5% into “a disaster everywhere”. Models love a bit of drama.

## Why a person approves every single post

A newsroom that publishes on its own will, sooner or later, publish a mistake with full confidence. Then the mistake is in hundreds of phones, and deleting it later does not delete it from people's memory.

One tap from a person costs a few seconds. It is the cheapest insurance there is.

The review step also changed *how I ask the model to write*. Instead of trying to make the model perfect — impossible — I made its drafts **easy to check**:

- posts are short, so you can read one in ten seconds;
- the source is always named, so you can open it;
- facts and opinion are in separate paragraphs, so you can see which is which.

> [!IDEA] Don't try to make the machine perfect. Make its work easy for a person to check.

## When the model talks to itself

Some models “think out loud”: before answering, they write their reasoning — usually in English — and sometimes they send that reasoning instead of the post. Something like: “Okay, the user wants a post in Russian. Let me think about the structure first…”

That should never even reach the editor. So there is a tiny automatic check: the channel is in Russian, so **more than half of the letters must be Russian letters**. If not, the answer is thrown away and the next model is asked. Try it:

{{demo:letters}}

Look at the Tajik example: it fails, even though it is a perfectly good text. Tajik letters like **ҳ, ҷ, қ, ӯ** are not in the Russian alphabet, so the check does not count them. That is fine here — this channel is Russian — but it shows something important: **every automatic rule is built for one situation**. A Tajik channel would need its own rule. Copying a rule without understanding it is how bugs are born.

## Free models change — so have a backup

The system can talk to many AI services that speak the same “language” (the OpenAI-compatible API, a common standard). Which model it uses is a setting, not code. That turned out to be important: more than once a free model was overloaded, started answering too slowly, or disappeared.

The fix is a **fallback chain**: a list of models in order. If the first one is busy, or answers with something that fails the letter check, the next one takes over. Play with it:

{{demo:chain}}

> [!WARNING] When every model fails, the system does not “do its best” and publish something anyway. It tells the editor plainly: try again in a few minutes. No post is better than a wrong post.

## Photos without stealing

News posts look better with a photo. But the photos belong to the news agencies — copying them into my channel would be using someone else's work.

So the bot does something else: it attaches the **link to the original article** and asks Telegram to show its preview large, above the text. The reader sees the picture, but it is shown *from the source, with the source's name*. The photo stays the publisher's, and every post sends readers to the original.

## Going deeper: the real code

Here is the letter check, exactly as it runs in the newsroom (Python):

```python
def looks_russian(text: str) -> bool:
    letters = re.findall(r"[^\W\d_]", text)     # every letter, in any alphabet
    cyrillic = re.findall(r"[а-яёА-ЯЁ]", text)  # only Russian letters
    return bool(letters) and len(cyrillic) / len(letters) > 0.5
```

And the heart of the fallback chain, slightly shortened:

```python
for model in settings.ai_models_list:          # the models, in order
    try:
        return await ask_model(client, model, news)
    except RetryableError as e:                 # busy, too slow, wrong language…
        failures.append(str(e))                 # remember why, try the next one

raise GenerationError("All models are unavailable, try again in a few minutes.")
```

Notice how small these are. Reliable systems are rarely one clever trick; they are many small, plain rules, each one easy to read and easy to test.

What the whole system runs on:

- **Python, FastAPI and SQLite** — the program and its database;
- **aiogram** — the Telegram bot (the same library as in lesson 1);
- **Next.js** — the web panel for moderation;
- **Docker Compose and Caddy** — packaging and HTTPS, on one small Azure server.

## What a business can take from this

The same pattern — **collect, draft with AI, let a person approve, publish** — works far beyond news:

- answers to customer questions: the AI drafts, a manager sends;
- product descriptions for an online shop;
- weekly reports from a spreadsheet;
- posts for social networks in three languages.

The automation does the slow part. A person keeps the judgement.

## Check yourself

```quiz
? What does an AI language model do when it writes?
- It checks every fact in a database before writing
+ It writes the words that most likely fit, based on what it has read
- It copies the original article word for word
! A model predicts likely text. That is why it writes smoothly — and why it can be confidently wrong.

? A draft says 120 houses were flooded; the source says 12. What should the editor do?
- Approve — the model is usually right
+ Reject or fix it — the number must match the source
- Publish it and correct it later
! A wrong number, once published, spreads. The editor's job is exactly to catch this.

? Why is the newsroom's letter check rejecting a good Tajik text?
- Tajik texts are always too long
+ The rule counts only Russian letters, and Tajik has letters like ҳ and ҷ that it does not count
- The model was overloaded
! Every automatic rule is made for one situation. This channel is Russian; a Tajik channel needs its own rule.

? All three models in the chain are unavailable. What happens?
- The system publishes the source article in English
- The system picks the least bad answer
+ Nothing is published, and the editor is told to try again later
! No post is better than a wrong post.

? How does the bot show a news photo without copying it?
+ It shows a large preview of the link to the original article
- It downloads the photo and uploads it to the channel
- It asks the AI to draw a similar picture
! The preview is shown from the source, with its name, so the photo stays the publisher's.
```

## Little dictionary

- **AI language model** — a program that writes text by predicting which words most likely come next.
- **RSS feed** — a list of fresh articles that a news site publishes for programs to read.
- **Draft** — a post written by the AI and waiting for a person.
- **Human in the loop** — a design where a person approves the machine's work before it has any effect.
- **Fallback chain** — a list of backups tried in order when the first choice fails.
- **API** — the way one program asks another program for something.
- **Link preview** — the card with picture and title that Telegram shows for a link.

## Want something like this for your work?

The same approach works for customer replies, reports, product texts and social posts — in Tajik, Russian and English, with a person approving what matters. Tell me which task takes most of your time: [@SimorghDev](https://t.me/SimorghDev).
