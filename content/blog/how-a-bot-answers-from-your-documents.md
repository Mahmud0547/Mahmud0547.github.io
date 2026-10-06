---
title: "How an AI bot answers from your documents — and why it says “I don't know”"
description: "Ask a café's bot a question and watch it break your words apart, search its cards and write the answer. Change a price — and the answer changes with it."
date: 2026-10-06
tags: AI bots, Telegram bots, Small business
series: how-it-works
lesson: 6
level: beginner
learn: why a clever AI still does not know your prices; how a bot finds the right piece of your information before it answers; what happens in three steps — words, search, answer; why “I don't know” is the most important thing a business bot can say; how to change what the bot knows without a programmer
---
Imagine a new waiter on his first day. He is smart and polite, but he has never seen your menu. A guest asks: “How much is the plov?” What should he do?

A bad waiter **guesses**: “About thirty somoni, I think.” A good waiter **looks at the menu card** first and reads the real price. And if the guest asks something that is not on any card, a good waiter says: “Let me ask the manager.”

An AI bot for a business should work exactly like the good waiter. This lesson shows how.

## A clever AI does not know your business

Modern AI models have read an enormous amount of text. They can write, translate and explain. But they have never seen **your** menu, **your** delivery zone or **your** opening hours. If you simply ask a model “How much is the plov in Navruz café?”, it will often give a confident answer anyway — an invented one.

That confident invention even has a name: a **hallucination**. For a business it is dangerous: a wrong price or a wrong address makes customers angry.

> [!IDEA] An AI model knows a lot about the world and nothing about your shop. Everything it should know about your shop, you have to give it.

## The trick: give the bot your cards first

So a business bot does not answer from memory. It keeps your information on small **cards**: one about the menu, one about delivery, one about opening hours, one about payment. When a question comes in, the bot:

1. **Takes the question apart** into words, and throws away the little ones that mean nothing on their own (“how”, “the”, “you”).
2. **Searches the cards** for those words and gives each card a score: how well does it match?
3. **Answers from the best card** — and only from it. If no card matches well enough, it does not make anything up.

This is called **answering from documents**. Programmers call it RAG — retrieval-augmented generation: first find, then write.

## Try it

Ask the bot of an invented café, “Navruz”. Try the ready questions, then type your own. Then change the price of plov and ask again.

{{demo:knowledge}}

Did you see the plov price change in the answer the moment you changed the card? Nobody retrained the bot. The bot simply reads the card every time. To teach it something new, you change a card — like changing a menu, not like rebuilding the café.

## Step by step

**Words.** The question “How much does plov cost?” becomes the useful words *plov* and *cost*. The rest are crossed out — they appear in almost every question and help nothing.

**Search.** The bot compares those words with every card. The menu card contains *plov* and *costs* — a strong match. The delivery card contains neither. Each card gets its bar: the longer the bar, the better the match. The bot also understands that *cost* and *costs* are the same word, because they start the same way.

**Answer.** The best card goes to the AI, and the AI writes the answer only from what is written there. That is why the bot can also show its **source**: “Answer taken from: Menu and prices”.

> [!WARNING] In this lesson the search compares letters, to keep it simple. Real bots compare **meaning**: they understand that “What do I pay for plov?” and “How much is plov?” ask the same thing, even with different words. The idea stays the same — first find, then answer.

## “I don't know” is a feature, not a failure

Ask the café bot about a helicopter pad. No card mentions it, so the bot answers: “I'm not sure — I'll pass your question to a manager.”

For a business, this is the most important sentence a bot can say. A bot that admits it does not know, and hands the question to a person, never invents a discount, a delivery zone or a price. Customers forgive “let me check”. They do not forgive a wrong price.

## For anyone ordering an AI bot

Before you accept a bot for your business, ask three questions:

1. **Where does it get its answers?** The good answer: from your cards or documents, and it can show which one.
2. **What does it do when it does not know?** The good answer: it says so and passes the question to a person.
3. **How do I change what it knows?** The good answer: you edit a card or a document yourself, and the next answer already uses it — no programmer needed.

## Check yourself

```quiz
? Why can a clever AI model give a wrong price for your café?
- Because it is broken
+ Because it has never seen your menu, so it guesses
- Because prices are secret
! A model knows the world, not your shop. It needs your cards.

? What does the bot do first when a question comes in?
+ Takes the question apart into useful words
- Writes the answer straight away
- Calls the manager
! First the words, then the search, then the answer.

? You change the price of plov on the menu card. What happens?
- Nothing until a programmer retrains the bot
+ The next answer already uses the new price
- The bot forgets the whole menu
! The bot reads the card every time it answers.

? No card matches the question. What should a good business bot do?
- Invent the most likely answer
+ Say it is not sure and pass the question to a person
- Stay silent
! “Let me check” is better than a confident mistake.

? What is a “hallucination” in AI?
- A picture the AI draws
+ A confident answer that is made up
- A very long answer
! It sounds right, but nothing supports it.
```

## Little dictionary

- **Card (document)** — a small piece of your information: the menu, delivery rules, opening hours.
- **Search** — finding which card fits the question best.
- **Score** — how well a card matches, from 0% to 100%.
- **Source** — the card the answer was taken from.
- **Hallucination** — a confident answer that the AI made up.
- **RAG** — “find first, then write”: the way business bots answer from documents.

## A bot that answers from your information

I build Telegram bots that answer from your own menu, price list or rules — in Tajik, Russian and English — show where each answer came from, and hand the hard questions to a person. Questions: [@SimorghDev](https://t.me/SimorghDev).
