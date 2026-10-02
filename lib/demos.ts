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
