// Logic behind the interactive blog demos. Kept free of React so it can be unit-tested.

export interface Rule {
  when: string;
  reply: string;
}

/** The first rule whose keyword appears in the message, case-insensitively; -1 when none matches. */
export function matchRule(rules: Rule[], message: string): number {
  const text = message.toLowerCase();
  return rules.findIndex((rule) => rule.when.trim() !== "" && text.includes(rule.when.trim().toLowerCase()));
}

/** Python (aiogram 3) code that behaves like the rules: what the reader built, as a real bot would be written. */
export function pythonCode(rules: Rule[], fallback: string): string {
  const quote = (s: string) => JSON.stringify(s);
  const active = rules.filter((r) => r.when.trim() !== "");
  const lines = [
    "@dp.message()",
    "async def answer(message: Message):",
    '    text = (message.text or "").lower()',
  ];
  active.forEach((rule, i) => {
    lines.push(`    ${i === 0 ? "if" : "elif"} ${quote(rule.when.trim().toLowerCase())} in text:`);
    lines.push(`        await message.answer(${quote(rule.reply)})`);
  });
  if (active.length > 0) lines.push("    else:");
  lines.push(`${active.length > 0 ? "        " : "    "}await message.answer(${quote(fallback)})`);
  return lines.join("\n");
}

export type Currency = "USD" | "EUR" | "RUB" | "TJS";

const currencyWords: [RegExp, Currency][] = [
  [/(usd|\$|dollar|доллар)/, "USD"],
  [/(eur|€|euro|евро)/, "EUR"],
  [/(rub|₽|руб|рубл)/, "RUB"],
  [/(tjs|somoni|сомон)/, "TJS"],
];

export interface AmountParse {
  cleaned: string;
  amount: number | null;
  currency: Currency | null;
}

/** How a bot reads "100 usd": tidy the text, find a number, find a currency word. */
export function parseAmount(input: string): AmountParse {
  const cleaned = input.trim().toLowerCase().replace(/\s+/g, " ");
  const number = /\d+(?:[.,]\d+)?/.exec(cleaned.replace(/(\d)\s(?=\d{3}\b)/g, "$1"));
  const amount = number ? Number(number[0].replace(",", ".")) : null;
  const currency = currencyWords.find(([pattern]) => pattern.test(cleaned))?.[1] ?? null;
  return { cleaned, amount, currency };
}

// ── Lesson 2: the AI newsroom ────────────────────────────────────────────────

export interface ScriptCheck {
  letters: number;
  cyrillic: number;
  share: number;
  pass: boolean;
}

/**
 * The newsroom's real check (simorgh-news, ai/generator.py looks_russian): a post must be in Russian, so more than
 * half of its letters must be Russian Cyrillic. Otherwise the model probably sent its reasoning instead of a post.
 */
export function cyrillicCheck(text: string): ScriptCheck {
  const letters = text.match(/\p{L}/gu)?.length ?? 0;
  const cyrillic = text.match(/[а-яёА-ЯЁ]/g)?.length ?? 0;
  const share = letters ? cyrillic / letters : 0;
  return { letters, cyrillic, share, pass: letters > 0 && share > 0.5 };
}

export type ModelState = "ok" | "busy" | "english";

export interface ChainStep {
  model: string;
  state: ModelState;
}

/** Tries the models in order, like the newsroom's fallback chain; returns what happened and who wrote the post. */
export function runChain(models: { name: string; state: ModelState }[]): { steps: ChainStep[]; writer: string | null } {
  const steps: ChainStep[] = [];
  for (const model of models) {
    steps.push({ model: model.name, state: model.state });
    if (model.state === "ok") return { steps, writer: model.name };
  }
  return { steps, writer: null };
}

// ── Lesson 3: official data ──────────────────────────────────────────────────

/** Somoni for `amount` units when the bank publishes `value` somoni per `nominal` units. */
export function toSomoni(amount: number, value: number, nominal: number): number {
  return (amount * value) / nominal;
}

// ── Lesson 4: access rules ───────────────────────────────────────────────────

export type Role = "visitor" | "member" | "editor" | "admin";
export type Action = "readPublic" | "readMembers" | "writePost" | "readInbox" | "makeAdmin";

const allowedBy: Record<Action, Role[]> = {
  readPublic: ["visitor", "member", "editor", "admin"],
  readMembers: ["member", "editor", "admin"],
  writePost: ["editor", "admin"],
  readInbox: ["admin"],
  makeAdmin: [], // nobody may raise their own role; admins change roles of others through one checked function
};

export type AccessResult = "allowed" | "hidden" | "refused" | "leaked";

/**
 * What happens when `role` tries `action`.
 * - Rules only in the app: the app hides the button, but a direct request reaches a database that answers anyone.
 * - Rules in the database: the answer is the same however the request arrives.
 */
export function tryAccess(role: Role, action: Action, rulesIn: "app" | "database", via: "app" | "api"): AccessResult {
  const permitted = allowedBy[action].includes(role);
  if (permitted) return "allowed";
  if (via === "app") return "hidden";
  return rulesIn === "database" ? "refused" : "leaked";
}

// ── Lesson 5: slow internet ──────────────────────────────────────────────────

export type Network = "4g" | "3g" | "2g";

/**
 * Speed and delay per connection. 3G and 2G are the boundaries Chrome itself uses to report
 * navigator.connection.effectiveType (700 kbit/s and 270 ms, 70 kbit/s and 1400 ms); 4G is a typical city connection.
 */
export const networks: Record<Network, { kbps: number; rttMs: number }> = {
  "4g": { kbps: 10_000, rttMs: 50 },
  "3g": { kbps: 700, rttMs: 270 },
  "2g": { kbps: 70, rttMs: 1400 },
};

export type PartId = "html" | "css" | "fonts" | "js" | "photos";

export interface PagePart {
  id: PartId;
  /** Compressed size in kilobytes, as it travels over the network. */
  kb: number;
  /** 1: the page itself; 2: what the page asks for at once; 3: what is needed only further down. */
  wave: 1 | 2 | 3;
  /** Loaded in the light version too (false: waits for a tap). */
  inLite: boolean;
}

/** This site's home page, measured from the build on 2026-10-03 (gzip for text, file size for fonts and photos). */
export const homePage: PagePart[] = [
  { id: "html", kb: 19, wave: 1, inLite: true },
  { id: "css", kb: 10, wave: 2, inLite: true },
  { id: "fonts", kb: 59, wave: 2, inLite: true },
  { id: "js", kb: 183, wave: 2, inLite: true },
  { id: "photos", kb: 342, wave: 3, inLite: false },
];

/** The parts a version downloads before the visitor taps anything. */
export function partsFor(parts: PagePart[], lite: boolean): PagePart[] {
  return parts.filter((p) => !lite || p.inLite);
}

/**
 * A rough load time: one round trip per wave of requests, plus the time to move every byte.
 * Real browsers overlap more, but the proportions — and the lesson — stay the same.
 */
export function loadSeconds(parts: PagePart[], network: Network, lite: boolean): number {
  const { kbps, rttMs } = networks[network];
  const used = partsFor(parts, lite);
  const waves = new Set(used.map((p) => p.wave)).size;
  const kb = used.reduce((sum, p) => sum + p.kb, 0);
  return (waves * rttMs) / 1000 + (kb * 8) / kbps;
}

// ── Articles: the routine calculator ─────────────────────────────────────────

export interface Routine {
  /** How many times a day the task is done by hand. */
  perDay: number;
  /** Minutes one time takes by hand. */
  minutes: number;
  /** Minutes a person still spends per item once a bot does the work (checking, like the Simorgh editor). */
  checkMinutes: number;
  /** Cost of one working hour, in US dollars. */
  hourlyRate: number;
  /** Working days in a month. */
  days?: number;
}

export interface RoutineResult {
  hoursBefore: number;
  hoursAfter: number;
  hoursSaved: number;
  moneySaved: number;
  /** Working days until the saved time pays for a bot of the given price; null when nothing is saved. */
  paybackDays: number | null;
}

/** What a repeated task costs a month by hand and with a bot that leaves a person only the check. */
export function routineCost(r: Routine, botPrice: number): RoutineResult {
  const days = r.days ?? 22;
  const hoursBefore = (r.perDay * r.minutes * days) / 60;
  const hoursAfter = (r.perDay * Math.min(r.checkMinutes, r.minutes) * days) / 60;
  const hoursSaved = hoursBefore - hoursAfter;
  const moneySaved = hoursSaved * r.hourlyRate;
  const perDay = moneySaved / days;
  return { hoursBefore, hoursAfter, hoursSaved, moneySaved, paybackDays: perDay > 0 ? botPrice / perDay : null };
}

// ── Lesson 6: a bot that answers from your documents ─────────────────────────

export interface KbCard {
  id: string;
  title: string;
  text: string;
}

export interface KbMatch {
  id: string;
  /** Share of the question's words found in the card, 0…1. */
  score: number;
  /** The question's words that the card contains. */
  words: string[];
}

/**
 * Word keys for matching: lower case, ё → е, words of 3+ letters, minus stop words, cut to 5 letters
 * so that "доставка" and "доставляете" meet. Real bots compare meaning (embeddings); this is the same idea, simplified.
 */
export function wordKeys(text: string, stop: string[]): string[] {
  const stopSet = new Set(stop.map((w) => w.toLowerCase().replace(/ё/g, "е")));
  const words = text.toLowerCase().replace(/ё/g, "е").match(/[\p{L}\d]+/gu) ?? [];
  return [...new Set(words.filter((w) => w.length >= 3 && !stopSet.has(w)).map((w) => w.slice(0, 5)))];
}

/** Ranks cards by how many of the question's word keys each one contains, best first. */
export function rankCards(question: string, cards: KbCard[], stop: string[]): KbMatch[] {
  const asked = wordKeys(question, stop);
  return cards
    .map((card) => {
      const has = wordKeys(`${card.title} ${card.text}`, stop);
      // Same word in another form: one key starts with the other (at least 4 letters in common).
      const words = asked.filter((k) => has.some((h) => h === k || (Math.min(h.length, k.length) >= 4 && (h.startsWith(k) || k.startsWith(h)))));
      return { id: card.id, score: asked.length ? words.length / asked.length : 0, words };
    })
    .sort((a, b) => b.score - a.score);
}

/** The card the bot answers from, or null when nothing matches well enough — then a person should answer. */
export function bestCard(ranked: KbMatch[], minScore = 0.3): string | null {
  return ranked[0] && ranked[0].score >= minScore ? ranked[0].id : null;
}

// ── Article 2: news does not sleep ──────────────────────────────────────────

/**
 * Articles per hour of publication (UTC) in the Simorgh database, 29 September – 6 October 2026:
 * 1,498 articles from BBC News and Al Jazeera, read from the production database on 6 October.
 */
export const NEWS_BY_UTC_HOUR = [57, 34, 27, 32, 48, 58, 44, 44, 63, 47, 74, 85, 82, 77, 73, 91, 94, 67, 50, 66, 62, 69, 62, 92];

/** Counts per local hour for a UTC offset in whole hours. */
export function toLocalHours(utc: number[], offset: number): number[] {
  const local = new Array(24).fill(0);
  utc.forEach((count, hour) => (local[(((hour + offset) % 24) + 24) % 24] += count));
  return local;
}

/** Whether `hour` is inside working hours [start, end); handles shifts over midnight. */
export function isWorkingHour(hour: number, start: number, end: number): boolean {
  if (start === end) return false;
  return start < end ? hour >= start && hour < end : hour >= start || hour < end;
}

/** How much arrives outside working hours. */
export function outsideHours(counts: number[], start: number, end: number): { outside: number; total: number; share: number } {
  const total = counts.reduce((s, c) => s + c, 0);
  const outside = counts.reduce((s, c, h) => s + (isWorkingHour(h, start, end) ? 0 : c), 0);
  return { outside, total, share: total ? outside / total : 0 };
}
