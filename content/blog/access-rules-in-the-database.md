---
title: Why access rules belong in the database
description: Hiding a button is not security. How the Kamarob platform keeps members-only data safe with Postgres Row Level Security — and tests it.
date: 2026-09-28
tags: Security, Supabase, Nonprofits
---

When an organisation keeps member data, internal documents or private chats online, the question is not "can people log in?" but "what exactly can each person read and change?". A common mistake is to answer that question only in the interface: hide the "Delete" button from members, and hope nobody calls the API directly.

In the Kamarob platform I put the answer in the database itself.

## Row Level Security in one paragraph

Postgres can attach a rule to every table: before returning or changing a row, check who is asking. If the rule says no, the database refuses — no matter which screen, script or API call asked. The interface still hides buttons, but it is no longer the thing keeping data safe.

## What the rules look like

Kamarob has members, editors, administrators and a public read-only "demo admin". A few of the real rules, simplified:

```sql
-- Anyone sees published public posts; members also see members-only posts.
create policy "posts: published for their audience" on posts for select
  using (status = 'published' and (visibility = 'public' or is_member()));

-- Only editors and admins can write posts.
create policy "posts: editors write" on posts for insert with check (can_edit());

-- People may change only their name and language, never their own role.
revoke update on profiles from authenticated;
grant update (full_name, locale) on profiles to authenticated;
```

Roles are changed only through one function that checks the caller is an administrator. Members-only documents are downloaded through links that expire after 60 seconds, so a file cannot be shared by forwarding a link.

## Test the rules, not just the screens

Rules that are not tested drift. Kamarob has a separate test suite that logs in as different people against the real database and checks what they can and cannot do:

- a visitor cannot read profiles, chat or the inbox;
- the demo admin can open the admin panel but every write is refused;
- the demo admin sees only sample people and messages, never real visitors' data;
- nobody can download a members-only file without logging in.

Ten checks, run before every release.

## For organisations choosing a system

Ask your developer three questions: where are the access rules enforced, are they tested, and what happens if someone calls the API without the interface? If the answer to the first one is "in the app", the data is one bug away from leaking.

Try the platform — there is a read-only admin login on the home page: [kamarob.simorgh-dev.workers.dev](https://kamarob.simorgh-dev.workers.dev)
