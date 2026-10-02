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
