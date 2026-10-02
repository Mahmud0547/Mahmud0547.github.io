---
title: "How a Telegram bot works — explained so a child could get it"
description: "Follow one message from your phone to a bot and back, build a tiny bot right in the page, and see the real code behind it. No experience needed."
date: 2026-10-02
tags: Telegram bots, Explained simply, Python
series: how-it-works
lesson: 1
level: beginner
learn: what happens to a message between your phone and a bot; how a bot chooses its answer — and build one yourself; the difference between polling and a webhook; how to keep a bot's token safe
---
You write “/start” to a bot, and in less than a second it answers — with your name, with buttons, sometimes with a photo. It feels like a person is sitting on the other side. Nobody is. So who answers?

This article explains it from the very beginning. We will follow one message on its whole trip, you will build a small bot yourself right here on the page, and at the end you will see the real code that does the same job. If you have never written a line of code — good, this was written for you. If you have, the last sections go deeper.

## The short answer: a shop assistant who never sleeps

Imagine a small shop with a very fast assistant. The assistant has a **list of rules** pinned to the wall: “If someone asks about the price — show the price list. If someone asks when we open — say 9 to 6. If you don't understand — ask politely again.”

A Telegram bot is exactly that assistant. It is a **program**: a list of rules written in code. It does not think like a person and it does not get tired. It reads what you wrote, finds the rule that fits, and answers. Thousands of times a day, at 3 a.m. too.

Three helpers make it work:

- **Telegram** — the post office. It carries every message between you and the bot.
- **The bot's server** — the brain. A computer somewhere in the world where the bot's program runs.
- **The database** — the notebook. Where the bot writes down what it must not forget: your language, your order, your last question.

## A message's journey

Now let's follow one message. Choose what to send, then press **Next step** (or **Play**) and watch where the message is at every moment. The dark box shows what the data really looks like at that point.

{{demo:bot-flow}}

> [!IDEA] Telegram delivers, the bot thinks. Every message goes through Telegram in both directions — the bot never talks to your phone directly.

Did you notice the most surprising part? **Your message never goes straight to the bot.** It always goes through Telegram, in both directions. That is why a bot can answer you on your phone, your laptop and your tablet at once — Telegram does the delivering, the bot only does the thinking.

## The three helpers, one by one

### Telegram: the post office

Telegram's servers receive your message first. For a bot, they do one more job: they turn your message into an **update** — a small parcel with a label. The label says who sent it, from which chat, at what time, and what is inside (text, a photo, a button press).

Telegram also gives every bot an address on the internet called the **Bot API**. The bot talks to Telegram only through this address, using simple requests like “give me new parcels” or “send this text to chat 123456”.

### The server: the brain

The bot's program has to run somewhere, all day and all night. That “somewhere” is a server — just a computer in a data centre that is never switched off. My own news bot runs on a small rented server in the cloud; Kursi Tojik, the currency site I built, runs on Cloudflare's network.

When an update arrives, the program wakes up, reads it, picks a rule, and answers. Then it waits for the next one.

### The database: the notebook

Without a notebook, the bot would forget you the moment it answered. Ask “What's the price?” and then “And delivery?” — and it would not know you were talking about the same order.

So the bot writes things down in a **database**: a very organised notebook with tables, like a spreadsheet. One row per person: their chat number, their language, what they ordered. The next time you write, the bot looks you up first.

## Commands and buttons

A **command** is a message that starts with a slash: `/start`, `/help`, `/price`. Commands are the bot's main doors. Telegram even shows a menu with them when you type “/”. Every bot gets `/start` first: it is what Telegram sends for you when you press the big **Start** button.

**Buttons** come in two kinds:

- **Reply keyboard** — buttons instead of your normal keyboard. Pressing one simply sends its text, as if you typed it.
- **Inline buttons** — buttons attached under a bot's message. Pressing one does not send text; it sends the bot a quiet signal (a *callback*) like `buy:42`. The bot can then change the message, show the next page, or confirm an order.

Buttons are not just pretty. They protect people from typing mistakes, and they protect the bot from guessing.

## Build your own bot

Time to be the programmer. Below is a bot with two rules. Change the words, add a rule, then write to your bot in the test chat. Watch the small grey note under every answer: it tells you **which rule fired**.

{{demo:bot-playground}}

Try these experiments:

1. Write “price?” and then “PRICE!!!” — both work, because the bot compares in small letters.
2. Make two rules that both fit the same message. Which one answers? Always the **first** one from the top. Order matters.
3. Write something no rule knows. The bot does not crash — it uses the default answer. A good bot always has one.
4. Open **The same bot in Python**. That is real code. Every rule you add becomes an `elif` line. You have just written a program without typing it.

This “if this — then that” idea is the heart of every bot. Big bots simply have more rules, and smarter ways to check them.

## How a bot understands “100 usd”

People don't write like machines. One writes “100 usd”, another “100$”, a third “100 Dollars”, a fourth “1 000 сомони”. A good bot must understand all of them.

The trick is to break the job into tiny steps, each one easy. Type different amounts below and watch each step.

{{demo:amount}}

Look at what happens when something is missing: the bot does not guess. If there is no currency, it **asks**. Guessing with money is how mistakes happen. This is a rule I keep in every project: when you are not sure, ask the person — never make up a number.

## Two ways to get messages: the mailbox and the doorbell

How does the bot learn that a new update has arrived? There are two ways, and they are worth knowing because they change how the bot is built.

**Polling — checking the mailbox.** The bot keeps asking Telegram: “Anything new? … Anything new?” Telegram holds each question open for a little while (this is called *long polling*) and answers as soon as a message comes. It is simple, works on any computer, even a laptop at home, and is perfect for learning and for small bots.

**Webhook — the doorbell.** The bot gives Telegram its own web address once. From then on, Telegram rings the doorbell: it sends every update to that address the moment it arrives. The bot does not have to ask at all. This needs a server with a proper HTTPS address, but it saves work and scales well. Serverless platforms like Cloudflare Workers can only work this way, because they wake up only when someone knocks.

| | Polling (mailbox) | Webhook (doorbell) |
|---|---|---|
| Who starts the conversation | the bot asks Telegram | Telegram calls the bot |
| Needs a public HTTPS address | no | yes |
| Good for | learning, small bots, home computer | production, many users, serverless |

## The token: the key to the bot

When you create a bot with Telegram's official helper, **@BotFather**, you get a **token** — a long line like `123456789:AAH...`. This token is the key to the bot. Whoever has it can read the bot's messages and write as the bot.

> [!WARNING] The token is like the key to your house. Anyone who sees it can act as your bot.

Three rules, no exceptions:

- **Never** put the token into code that goes to GitHub, into a screenshot, or into a chat.
- Keep it in a secret place the server reads at start — an environment variable or the hosting platform's secret storage.
- If it leaks, open @BotFather, choose your bot and revoke the token. The old key stops working immediately, and you get a new one.

That is exactly how my own bots are set up: the token is stored only in the server's secret storage, and the code reads it from there.

## What a bot cannot do

Knowing the limits saves money and disappointment:

- **A bot cannot write first.** A person must open the bot and press Start. Only then can the bot send them messages. This protects everyone from spam.
- **In groups, a bot does not see everything by default.** In “privacy mode” it only gets commands and messages addressed to it.
- **A bot only knows what you teach it.** It will not answer a question it has no rule — or no AI model — for. Adding AI makes answers smarter, but someone still has to decide what the bot may and may not say.
- **Telegram limits speed.** A bot cannot send thousands of messages per second; big mailings must be spread out over time.

## Going deeper: the real code

Here is a complete small bot in Python, using the popular **aiogram** library. It greets you on `/start` and repeats every other message back.

```python
import asyncio
import os

from aiogram import Bot, Dispatcher
from aiogram.filters import CommandStart
from aiogram.types import Message

dp = Dispatcher()


@dp.message(CommandStart())
async def start(message: Message):
    # Rule 1: someone pressed Start.
    await message.answer("Hello! Send me anything and I will repeat it.")


@dp.message()
async def echo(message: Message):
    # Rule 2: everything else. This is the "default answer".
    await message.answer(message.text or "I can only read text for now.")


async def main():
    bot = Bot(token=os.environ["BOT_TOKEN"])  # the token comes from a secret, not from the code
    await dp.start_polling(bot)  # the "mailbox" way


asyncio.run(main())
```

Read it like a story:

1. `Dispatcher` is the bot's list of rules.
2. Each `@dp.message(...)` line pins one rule to the wall. `CommandStart()` means “only the /start command”; empty brackets mean “any message”.
3. The rules are checked **from top to bottom** — just like in the playground above.
4. `message.answer(...)` asks Telegram to deliver the reply. Behind it is the `sendMessage` request you saw in the journey.
5. `start_polling` starts checking the mailbox, forever.

And this is what one update really looks like when it reaches the bot (shortened):

```json
{
  "update_id": 81546203,
  "message": {
    "message_id": 52,
    "from": { "id": 123456, "first_name": "Dilnoza", "language_code": "tg" },
    "chat": { "id": 123456, "type": "private" },
    "date": 1790930000,
    "text": "/start"
  }
}
```

Notice `language_code`. Telegram tells the bot which language your app uses, so a good bot can greet you in Tajik, Russian or English from the very first message.

## What a real business bot adds

The echo bot is the skeleton. A bot that works for a shop, a clinic or an organisation adds muscles:

- **A database** — customers, orders, appointments.
- **Buttons and steps** — “choose a service → choose a day → choose a time → confirm”, so nobody types by hand.
- **A human in the loop** — the bot collects the request, a person confirms it. In my news project, an AI writes drafts, but every post waits for a human to press “Approve” before it reaches the channel.
- **Reminders** — the bot writes the day before an appointment or a payment.
- **Several languages** — the same rules, answers in the person's language.
- **Logs and backups** — so nothing is lost and every problem can be traced.

## Check yourself

```quiz
? Where does your message go first when you write to a bot?
- Straight to the bot's computer
+ To Telegram's servers
- To the database
! Telegram is the post office: it always carries messages between you and the bot, in both directions.

? Two rules fit the same message. Which one answers?
+ The first one from the top
- The last one
- Both, one after another
! The bot checks its rules from top to bottom and stops at the first one that fits — so order matters.

? Someone wrote “100” with no currency. What should a good bot do?
- Guess dollars, most people mean dollars
+ Ask which currency
- Ignore the message
! With money, guessing causes mistakes. A good bot asks.

? What is a webhook?
- A list of the bot's commands
- A kind of button
+ An address where Telegram “rings the doorbell” with every new message
! With a webhook, Telegram sends each update to the bot's address. With polling, the bot keeps asking for news.

? Your bot's token appeared in a public screenshot. What do you do?
- Nothing, nobody will notice
+ Revoke it in @BotFather and use the new one
- Rename the bot
! The token is the key to the bot. Revoking it makes the old key useless at once.
```

## Little dictionary

- **Bot** — a program that answers in Telegram by rules.
- **Bot API** — Telegram's address where bots send requests and get updates.
- **Update** — a parcel from Telegram: one new message, button press or other event.
- **Command** — a message that starts with “/”, like `/start`.
- **Inline button** — a button under a bot's message that sends the bot a quiet signal.
- **Server** — a computer that is always on, where the bot's program runs.
- **Database** — the bot's organised notebook.
- **Polling** — the bot keeps asking Telegram for new updates.
- **Webhook** — Telegram sends updates to the bot's web address itself.
- **Token** — the secret key that controls the bot.

## Want a bot like this for your work?

I build Telegram bots for businesses and organisations: bookings and reminders, orders, answers to frequent questions, posting to channels, with a human in the loop where it matters, in Tajik, Russian and English. Write to me on Telegram — [@SimorghDev](https://t.me/SimorghDev) — and tell me which job eats most of your day.
