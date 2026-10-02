---
title: "Who can see what: why access rules belong in the database"
description: "Hiding a button is not security. Try to break into a members-only system yourself and see how rules in the database keep data safe."
date: 2026-09-28
tags: Security, Supabase, Nonprofits
series: how-it-works
lesson: 4
level: intermediate
learn: the difference between hiding a button and really protecting data; what “roles” are — visitor, member, editor, administrator; how a database can refuse a request no matter who sends it; why download links that expire in 60 seconds are safer; three questions to ask any developer before trusting them with your data
---
Imagine a school. On the door of the teachers' room hangs a sign: “Teachers only”. Most students respect it. But the door is not locked. One curious student who ignores the sign can walk in and read the exam papers.

Many websites protect their data exactly like that: with a sign, not a lock. This lesson shows the difference — and lets you try to walk through the door yourself.

The example is **Kamarob**, a platform I built for nonprofit organisations: a public site, member accounts, internal news and documents, a team chat and an admin panel.

## The question that matters

When an organisation keeps member data, internal documents or private chats online, the important question is not “can people log in?”. It is:

**What exactly can each person read and change?**

To answer it, every person gets a **role**:

- **Visitor** — not logged in. Reads public news, can send a message through the contact form.
- **Member** — logged in. Also reads members-only news and documents, uses the chat.
- **Editor** — also writes news and uploads documents.
- **Administrator** — also manages members and roles, reads the contact-form inbox.

So far so good. The real question is **where these rules live**.

## A sign on the door: rules only in the app

The simplest way is to put the rules in the app. A member does not see the “Delete” button. A visitor does not see the “Inbox” link. It looks safe.

But the app is only one way to reach the data. Behind every website there is a server and a database, and the app talks to them through requests — the same kind of requests you saw in lesson 1. Anyone who knows how can send those requests **directly**, without the app, without buttons. Often the key for those requests is even inside the web page itself, because the browser needs it.

If the database itself has no rules, it answers anyone with that key. The hidden button was just a sign on an unlocked door.

## Try to break in

Choose who you are and what you want to do. First press **Use the app**. Then press **Send a request straight to the database**. Then move the rules into the database and try again.

{{demo:access}}

Did the visitor manage to read a members-only document when the rules were only in the app? That is how real data leaks happen: nobody “hacked” anything clever, they simply asked the database directly, and it answered.

> [!IDEA] The interface may hide buttons for convenience. But the thing that keeps data safe must be the database itself — the last door every request has to pass.

## A lock on the door: Row Level Security

The database Kamarob uses, **Postgres**, can attach a rule to every table: before showing or changing a row, check who is asking. This is called **Row Level Security** — RLS, rules for every row.

If the rule says no, the database refuses. It does not matter which screen, script or request asked. The app still hides buttons — that is good for people — but it is no longer the thing keeping the data safe.

## What the rules look like

Here are a few of Kamarob's real rules, slightly simplified. You can read them almost like English:

```sql
-- Anyone sees published public posts; members also see members-only posts.
create policy "posts: published for their audience" on posts for select
  using (status = 'published' and (visibility = 'public' or is_member()));

-- Only editors and admins can write posts.
create policy "posts: editors write" on posts for insert with check (can_edit());

-- Only administrators read the contact-form inbox.
create policy "contact: admins read" on contact_messages for select using (is_admin());

-- People may change only their name and language, never their own role.
revoke update on profiles from authenticated;
grant update (full_name, locale) on profiles to authenticated;
```

The last two lines deserve a closer look. Even a logged-in person, sending a request directly, **cannot change their own role** — the database simply does not allow that column to be changed. Roles are changed through one special function that first checks that the caller is an administrator.

> [!WARNING] “Only admins see this page” is not a rule about data. Ask instead: “Can a non-admin get this data in any way at all?” If you are not sure, the answer is probably yes.

## Links that expire

Members-only documents — reports, plans, contracts — are files. Files are usually downloaded by a link. But a link can be forwarded: a member copies it into a group chat, and now anyone with the link can download the file. Forever.

So Kamarob gives out **signed links** that work for only **60 seconds**. The member presses “Download”, the server checks that they are a member, creates a fresh link, and the browser uses it at once. If someone forwards that link, by the time anyone opens it, it is dead.

{{demo:signed-link}}

## Test the rules, not just the screens

Rules that are not tested slowly drift: someone adds a table and forgets its rule, or changes a function and opens a hole. So Kamarob has a separate set of tests that **log in as different people against the real database** and check what each one can and cannot do. For example:

- a visitor cannot read profiles, the chat or the inbox;
- a demo administrator can open the admin panel, but every change they try is refused;
- the demo administrator sees only sample people and messages, never real visitors' data;
- nobody can download a members-only file without logging in.

These tests run before every release. If a rule breaks, the release stops.

## The demo administrator: showing without risking

Kamarob's home page has a public demo login for the admin panel, so anyone can see how it works. That sounds dangerous — but with rules in the database it is safe: the demo role can **look** at the admin panel, sees only invented sample data, and every attempt to change anything is refused by the database itself. The same rules that protect the data make it possible to show the system openly.

## For organisations choosing a system

Before you trust a developer — or a ready-made platform — with your members' data, ask three questions:

1. **Where are the access rules enforced?** The good answer: in the database (or on the server), not only in the app.
2. **Are they tested?** The good answer: yes, automatically, before every release, logging in as different roles.
3. **What happens if someone sends requests without the app?** The good answer: exactly the same as through the app — refused where not allowed.

If the answer to the first question is “in the app”, your data is one curious student away from leaking.

## Check yourself

```quiz
? A member does not see the “Inbox” button. Does that protect the inbox?
- Yes, without the button nobody can open it
+ Not by itself — a request sent directly could still reach the data unless the database refuses it
- Yes, if the button is also red
! Hiding a button is a sign on the door. The lock has to be in the database.

? Rules live only in the app, and a visitor sends a request straight to the database. What happens?
+ The database answers — the data leaks
- The app stops the request
- Telegram blocks it
! Without rules in the database, it answers anyone who has the key.

? What does Row Level Security do?
- Encrypts the whole website
+ Checks, for every row, whether the person asking may see or change it
- Hides buttons in the app
! RLS puts the rules at the last door every request must pass.

? Why does a download link work for only 60 seconds?
- To save internet traffic
+ So a forwarded link is already useless when someone else opens it
- Because files are deleted after a minute
! A fresh link is made for each member at the moment they download.

? Can a logged-in member make themselves an administrator by sending a request directly?
- Yes, if they know the request
+ No — the database does not allow anyone to change their own role
- Only on weekends
! Roles change only through one function that checks the caller is an administrator.
```

## Little dictionary

- **Role** — a set of permissions: visitor, member, editor, administrator.
- **Request** — a message a program sends to a server or database asking for data or a change.
- **Row Level Security (RLS)** — rules in the database that decide, row by row, who may see or change what.
- **Policy** — one such rule.
- **Signed link** — a download link that carries a proof of permission and expires after a short time.
- **Demo account** — a public login that can look but not change anything.
- **Data leak** — when information reaches people who should not have it.

## Keeping your members' data safe

I build member platforms for organisations — news, documents, chat, admin panel — with access rules in the database and tests for every role, in Tajik, Russian and English. Try the demo: there is a read-only admin login on the home page of [kamarob.simorgh-dev.workers.dev](https://kamarob.simorgh-dev.workers.dev). Questions: [@SimorghDev](https://t.me/SimorghDev).
