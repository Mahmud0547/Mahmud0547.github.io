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

// ── Lesson 7: a message's trip around the world ────────────────────────────

export interface Place {
  id: string;
  lat: number;
  lon: number;
  /** For people: the Telegram data center of their region. */
  dc?: string;
}

/** Where readers are and where a bot's server can be. Names come from the lesson strings. */
export const PEOPLE: Place[] = [
  { id: "dushanbe", lat: 38.56, lon: 68.77, dc: "amsterdam" },
  { id: "dubai", lat: 25.2, lon: 55.27, dc: "amsterdam" },
  { id: "almaty", lat: 43.24, lon: 76.89, dc: "amsterdam" },
  { id: "moscow", lat: 55.76, lon: 37.62, dc: "amsterdam" },
  { id: "london", lat: 51.51, lon: -0.13, dc: "amsterdam" },
  { id: "newyork", lat: 40.71, lon: -74.01, dc: "miami" },
];
export const SERVERS: Place[] = [
  { id: "frankfurt", lat: 50.11, lon: 8.68 },
  { id: "dubai", lat: 25.2, lon: 55.27 },
  { id: "singapore", lat: 1.35, lon: 103.82 },
  { id: "virginia", lat: 39.04, lon: -77.49 },
];
/** Telegram's data centers: users are served from the one for their region (Amsterdam for Europe, Central Asia and the Middle East). */
export const TELEGRAM_DCS: Place[] = [
  { id: "amsterdam", lat: 52.37, lon: 4.9 },
  { id: "miami", lat: 25.76, lon: -80.19 },
  { id: "singapore", lat: 1.35, lon: 103.82 },
];

/** Light in optical fiber covers about 200,000 km per second, i.e. 200 km per millisecond. */
export const FIBER_KM_PER_MS = 200;

/** Great-circle distance in kilometres. */
export function distanceKm(a: Place, b: Place): number {
  const r = Math.PI / 180;
  const h = Math.sin(((b.lat - a.lat) * r) / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(((b.lon - a.lon) * r) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** The Telegram data center that serves a person: the one of their region, else the nearest. */
export function telegramFor(person: Place): Place {
  return TELEGRAM_DCS.find((dc) => dc.id === person.dc) ?? TELEGRAM_DCS.reduce((best, dc) => (distanceKm(person, dc) < distanceKm(person, best) ? dc : best));
}

export interface Leg {
  from: Place;
  to: Place;
  km: number;
  ms: number;
}

/** The four legs of a message and its reply: you → Telegram → bot → Telegram → you. */
export function messageTrip(person: Place, server: Place): { legs: Leg[]; km: number; ms: number } {
  const dc = telegramFor(person);
  const legs = [
    [person, dc],
    [dc, server],
    [server, dc],
    [dc, person],
  ].map(([from, to]) => {
    const km = distanceKm(from!, to!);
    return { from: from!, to: to!, km, ms: km / FIBER_KM_PER_MS };
  });
  const km = legs.reduce((s, l) => s + l.km, 0);
  return { legs, km, ms: km / FIBER_KM_PER_MS };
}

/** Whether a point is land, from the 2° Natural Earth mask in lib/land-mask.ts. */
export function makeLandTest(mask: { step: number; width: number; height: number; bits: string }): (lat: number, lon: number) => boolean {
  const bytes = Uint8Array.from(atob(mask.bits), (c) => c.charCodeAt(0));
  return (lat, lon) => {
    const row = Math.min(mask.height - 1, Math.max(0, Math.floor((90 - lat) / mask.step)));
    const col = (((Math.floor((lon + 180) / mask.step) % mask.width) + mask.width) % mask.width);
    const i = row * mask.width + col;
    return ((bytes[i >> 3]! >> (i & 7)) & 1) === 1;
  };
}

// ── Article 3: how fast a bot sees the news ────────────────────────────────

/**
 * Minutes from the time a source printed on an article to the moment Simorgh saved it, from the production
 * database (read on 8 October 2026): 1,797 articles published 30 September 06:00 – 8 October 00:00 UTC.
 */
export const DELAY_STATS = {
  all: { n: 1797, median: 37.8, p25: 23.3, p75: 78.2, le30: 670, le60: 1262, gt180: 302 },
  bbc: { n: 1111, median: 49.1, p25: 22.6, p75: 201.9, le30: 375, le60: 597, gt180: 302 },
  aljazeera: { n: 686, median: 32.9, p25: 23.9, p75: 42.7, le30: 295, le60: 665, gt180: 0 },
  checkEveryMin: 30,
} as const;

/** Delay buckets in minutes: ≤15, 15–30, 30–60, 1–3 h, over 3 h. */
export const DELAY_BUCKETS = [15, 30, 60, 180, Infinity] as const;

/** Articles by hour of publication (Dubai time, rows 0–23) and delay bucket (columns), same data as DELAY_STATS. */
export const DELAY_BY_HOUR: number[][] = [
  [9, 21, 30, 7, 13], [8, 16, 32, 9, 19], [6, 10, 18, 9, 22], [11, 11, 23, 19, 31], [4, 10, 25, 3, 15], [2, 9, 17, 5, 3],
  [3, 8, 12, 3, 6], [4, 9, 11, 4, 1], [8, 16, 18, 7, 9], [5, 15, 16, 11, 18], [4, 21, 16, 10, 9], [5, 10, 29, 9, 8],
  [14, 26, 23, 11, 10], [3, 17, 31, 9, 8], [21, 27, 30, 18, 14], [13, 28, 40, 16, 15], [7, 33, 29, 16, 10], [21, 18, 30, 17, 17],
  [15, 17, 32, 12, 10], [7, 43, 25, 15, 11], [13, 38, 31, 5, 16], [7, 21, 23, 9, 10], [6, 20, 23, 5, 12], [7, 23, 28, 4, 15],
];

/**
 * What a check interval means: a story that appears at a random moment waits on average half an interval and at
 * most a whole one. `estimatedMedian` swaps the measured 15-minute average wait for the new one — an estimate.
 */
export function checkEvery(minutes: number, sources = 2): { averageWait: number; worstWait: number; checksPerDay: number; estimatedMedian: number } {
  const averageWait = minutes / 2;
  return {
    averageWait,
    worstWait: minutes,
    checksPerDay: Math.round((1440 / minutes) * sources),
    estimatedMedian: Math.max(averageWait, DELAY_STATS.all.median - DELAY_STATS.checkEveryMin / 2 + averageWait),
  };
}

/** For each story time, the minutes until the next check (checks at 0, every, 2·every, …). */
export function waitsUntilCheck(storyMinutes: number[], every: number): number[] {
  return storyMinutes.map((t) => Math.ceil(t / every) * every - t);
}
