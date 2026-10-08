---
title: "How your message travels around the world — and comes back in less than a second"
description: "Follow one message on a 3D globe: from your phone to a tower, through glass cables under the sea, to Telegram, to a bot's server and back. Choose the cities yourself."
date: 2026-10-08
tags: Telegram bots, Explained simply, Internet
series: how-it-works
lesson: 7
level: beginner
hero: globe
learn: what happens to a message after you press Send; why light inside glass cables carries almost all of the internet; where Telegram and a bot's server really are; how to work out the time of the trip yourself; why the server's location matters for a business, and why it matters less than you think
---
You are in Dushanbe. You write to a café's bot: "Do you deliver?" A moment later the answer is on your screen. It feels as if the bot sits right next to you.

In fact the message has travelled thousands of kilometres — to another country and back. How does it get there so fast? Let's follow it.

## The short answer: your message turns into light

Your phone does not have a cable to the bot. So the message changes its form several times on the way:

1. **A radio wave.** The phone sends it through the air to the nearest mobile tower (or to your Wi-Fi router).
2. **Light.** From the tower it goes into a cable made of thin glass threads — **optical fibre**. Inside, the message travels as flashes of light.
3. **Data centres.** It arrives at big buildings full of computers: first Telegram's, then the one where the bot lives.

Then the answer makes the same trip back.

> [!IDEA] Light in a glass fibre travels about **200,000 km per second**. That is five times around the Earth in one second.

## The trip, step by step

### 1. From your phone to the tower

Your phone is a small radio station. It turns the letters into a radio wave and sends it to the nearest tower. The tower is usually only a few hundred metres to a few kilometres away, so this part is short.

### 2. Through glass cables, under land and sea

The tower is connected to the internet by optical fibre. Each thread is about as thin as a hair, and thousands of them run under streets, along railways and across the ocean floor. Almost all the internet traffic between continents travels through such cables under the sea.

### 3. To Telegram

Your message does not go straight to the bot. It always goes through **Telegram's data centre** first. For people in Europe, Central Asia and the Middle East, that is usually Telegram's data centre in Amsterdam. From Dushanbe that is about 5,000 km in a straight line.

### 4. To the bot's server

Telegram sees that the message is for a bot and passes it to the **server** where the bot's program runs. The server can be anywhere: in Frankfurt, in Dubai, in Singapore, in the USA. The bot's owner chooses.

### 5. The bot thinks — and the answer flies back

The program reads the message, looks into its database, maybe asks an AI model, and sends the answer. The answer flies the same way back: server → Telegram → your phone.

## Try it

Choose where you are and where the bot's server lives, then press **Send a message**. Turn the globe with your finger to see the whole route.

{{demo:message-globe}}

Try two cases: you in Dushanbe with the server in Frankfurt, and you in Dushanbe with the server in Virginia (USA). The second trip is much longer — the answer has to cross the Atlantic twice.

## Why real life is slower than light

The globe shows the shortest path: a straight line at the speed of light in glass. In real life a message is slower:

- **Cables are not straight.** They go around mountains and along coasts and have to land where countries allow it.
- **There are stops on the way.** Dozens of devices (routers) on the route each read the address and send the message on.
- **The bot needs time to think.** Finding an answer in a database takes milliseconds; asking an AI model often takes a few seconds — much longer than the whole trip.

As a rough rule, a real trip takes about twice as long as the straight line in glass. Even so, it is usually far shorter than a blink of an eye.

> [!WARNING] The numbers in the demo are the minimum that physics allows, not a measurement of a real bot. They show the scale: tens of milliseconds for the road, seconds for an AI answer.

## What this means for a business

- **Put the server closer to your customers when you can.** If your clients are in Dushanbe and Dubai, a server in Europe or the Gulf is closer to them than one in the USA.
- **But don't overpay for it.** People do not notice a difference of 50 milliseconds. A bot that thinks for three seconds feels slow anywhere in the world.
- **The bot's speed is mostly in its program.** Quick answers from your own data, and AI only where it is needed — that is what makes a bot feel instant.

## Check yourself

```quiz
? What does your message turn into inside an internet cable?
- Electricity in copper only
+ Flashes of light in thin glass threads
- Sound waves
! Long internet cables are made of optical fibre: the message travels as light.

? Where does your message go first when you write to a bot in Telegram?
- Straight to the bot's server
+ To Telegram's data centre
- To your mobile operator's office
! Every message passes through Telegram in both directions.

? About how fast does light travel in an optical fibre?
- 300 km per second
- 20,000 km per second
+ 200,000 km per second
! That is about five times around the Earth every second.

? Why is a real trip slower than the straight line in glass?
+ Cables are not straight and the message stops at many devices on the way
- Light gets tired on long trips
- Telegram reads every message by hand
! Detours and stops add time; the bot's thinking adds even more.

? Your clients are in Dushanbe. Which matters more for how fast the bot feels?
- Paying extra to move the server 1,000 km closer
+ Making the bot answer quickly, without long thinking where it is not needed
! The road takes milliseconds; slow thinking takes seconds.
```

## Little dictionary

- **Radio wave** — how a phone sends data through the air.
- **Optical fibre** — a glass thread as thin as a hair that carries data as light.
- **Data centre** — a building full of computers that are always on.
- **Server** — the computer where a bot's program runs.
- **Millisecond (ms)** — one thousandth of a second. A blink lasts about 300 ms.
- **Latency** — the time a message needs to get there and back.

## A bot that answers fast

I build Telegram bots that answer quickly: the server is chosen close to your customers, simple questions are answered from your own data, and AI is used only where it helps. Questions: [@SimorghDev](https://t.me/SimorghDev).
