---
title: "A website for slow internet: what a page really downloads"
description: "Why a site that opens in a second in the city takes half a minute in a village — and how one page can notice a slow connection and send less. Try it on this very site."
date: 2026-10-03
tags: Performance, Accessibility, Web
series: how-it-works
lesson: 5
level: beginner
learn: what a web page is made of and which parts weigh the most; why a slow connection hurts twice — less speed and longer waits; how a browser can tell a site that the connection is slow; what a “light version” changes and what it keeps; three questions to ask before ordering a website for people outside the capital
---
In Dushanbe, on good 4G, this website opens in under a second. In a village in the mountains, on 2G, the same page can take **more than a minute**. The site did not change. Only the road to it did.

Most websites are built and tested in an office with fast internet, and nobody notices the minute. This lesson shows where that minute comes from, and how this website — the one you are reading — saves most of it.

## A page is not one file

When you open a page, the browser first downloads one small file: the **HTML**, the text and structure of the page. Then the HTML says: “I also need these” — and the browser fetches the rest:

- **CSS** — styles: colours, sizes, layout;
- **fonts** — the letters themselves, if the site uses its own typeface;
- **JavaScript** — the code that makes buttons, demos and animations work;
- **photos** and other pictures.

Here is the home page of this website, measured from the real build:

| Part | Size |
|---|---|
| The page itself (HTML) | 19 KB |
| Styles (CSS) | 10 KB |
| Fonts | 59 KB |
| JavaScript | 183 KB |
| Photos | 342 KB |
| **Total** | **613 KB** |

More than half of everything is photos — and most of them are far down the page, where many visitors never scroll.

> [!IDEA] The heaviest part of a page is rarely the part people came for. Find out what weighs the most before deciding what to cut.

## Slow internet hurts twice

A connection has two numbers, not one:

- **Speed** — how many bytes per second can travel. On good 4G about 10 megabits a second; on weak 2G about 70 kilobits — **140 times less**.
- **Delay** — how long one question-and-answer trip takes, even for a tiny file. On 4G about 50 milliseconds; on 2G more than a second.

The browser does not get the page in one trip. It asks for the HTML, waits, reads it, then asks for styles, fonts and code, waits again, then asks for photos. Every wave of requests pays the delay again. So on a slow connection you pay for **every byte** and for **every wait**.

## Try it

Choose a connection and compare the two versions of this site's home page.

{{demo:slow-net}}

On 3G the full page needs about eight seconds, the light one less than four. On 2G the difference is more than half a minute. Nothing magic happened: the light version simply does not download the photos until someone asks for them.

## How the site knows the connection is slow

Some browsers — Chrome, Edge, Samsung Internet and most Android browsers — tell the page about the connection. JavaScript can read two things:

- **effectiveType** — the browser's own guess: “4g”, “3g”, “2g” or “slow-2g”;
- **saveData** — whether the person turned on data saving in their phone or browser.

This site checks both in a tiny script that runs **before anything is drawn**, so the page never flashes the heavy version first. Here is the real logic, slightly simplified:

```js
var connection = navigator.connection;
var slow = connection && (connection.saveData ||
  ["slow-2g", "2g", "3g"].includes(connection.effectiveType));
var choice = localStorage.getItem("lite"); // "on", "off" or nothing

if (choice === "on" || (choice !== "off" && slow)) {
  document.documentElement.setAttribute("data-lite", "auto");
}
```

Read it like a sentence: *if the person asked for the light version, or did not say no and the connection is slow — turn it on.* The person's own choice always wins over the guess.

> [!WARNING] Safari and Firefox do not report the connection — they keep it private. A site must never depend on the guess alone. That is why this site also has a **Light version** switch in the footer, for anyone, on any browser.

## What the light version changes

When the light version is on, a yellow note at the top says so and offers **Show full version**. Then:

1. **No animations.** Moving pictures cost battery and processor time on cheap phones.
2. **Photos wait.** In place of each photo there is a button: **Show photo · 157 KB**. You see the size before you pay for it.
3. **Exercises wait.** The interactive demos in these lessons appear as **Load the exercise** and download their code only when tapped.

What it does **not** change matters just as much: all the text, every link, the contact form and every language stay. The light version is not a poorer site. It is the same site that asks before sending the heavy parts.

> [!IDEA] A good light version removes waiting, not content. If people in the light version cannot do something important, it is not lighter — it is broken.

## A trick that makes it work: hidden photos are not downloaded

Photos far down a page are marked **lazy**: the browser downloads them only when they come close to the screen. And a lazy photo that is hidden is never downloaded at all. So the light version simply hides the photos and shows the button. When you press it, the photo appears — and only then does the browser fetch it. No extra code is needed for the saving itself; the browser does the work.

## For anyone ordering a website

If your visitors live outside the capital, use mobile data, or pay for every megabyte, ask three questions before you accept a site:

1. **How much does the home page weigh?** The good answer is a number, for example “613 KB, of which 342 KB are photos”. “It is fast” is not an answer.
2. **Was it tested on a slow connection?** The good answer: yes, with throttling to 3G, and the important things work.
3. **What happens on 2G or with data saving on?** The good answer: text and buttons come first; photos, video and heavy extras wait or come smaller.

## Check yourself

```quiz
? Which part of this site's home page weighs the most?
- The text of the page (HTML)
- The fonts
+ The photos
! 342 of 613 KB are photos — more than half.

? Why is a slow connection slow twice?
+ Each byte travels slower, and each wave of requests also waits longer
- Because the site is bigger on slow connections
- Because the browser downloads everything twice
! Speed and delay are two different numbers, and slow connections are bad at both.

? A visitor uses Safari. What does this site show them?
- Always the light version
+ The full version — Safari does not report the connection — with a switch to the light one in the footer
- An error message
! The guess is only a helper; the person's choice is what counts.

? In the light version, what happens to photos?
- They are deleted from the site
+ They are replaced by a button with their size, and download only if pressed
- They are shown in black and white
! Nothing is removed; you decide what to download.

? What must stay in a light version?
- Only the photos
- Nothing — it should be as empty as possible
+ All the text, links and important actions like the contact form
! A light version removes waiting, not content.
```

## Little dictionary

- **HTML** — the file with the text and structure of a page; the first thing a browser downloads.
- **CSS** — styles: colours, sizes, layout.
- **JavaScript** — code that runs in the browser and makes the page interactive.
- **Kilobyte (KB)** — a unit of size; 1,000 KB is about one megabyte.
- **Speed (bandwidth)** — how much data a connection moves per second.
- **Delay (latency)** — how long one request takes to go and come back, however small.
- **Lazy loading** — downloading a picture only when it is about to be seen.
- **Data saver** — a phone or browser setting that asks sites to send less.

## Websites for everyone who will use them

I build websites and bots that work on the connections real people have — in the city and in the mountains, in Tajik, Russian and English. This site is the example: switch the **Light version** on in the footer and see for yourself. Questions: [@SimorghDev](https://t.me/SimorghDev).
