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
