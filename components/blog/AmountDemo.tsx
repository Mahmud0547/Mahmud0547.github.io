"use client";

import { useId, useState } from "react";
import { parseAmount } from "@/lib/demos";
import { format, type Locale } from "@/lib/locale";
import { DemoFrame } from "./DemoFrame";
import { demoStrings } from "./strings";

export function AmountDemo({ locale }: { locale: Locale }) {
  const t = demoStrings[locale].amount;
  const id = useId();
  const [input, setInput] = useState("100 usd");
  const parsed = parseAmount(input);

  let result: string;
  if (parsed.amount === null) result = t.askNumber;
  else if (parsed.currency === null) result = t.askCurrency;
  else result = format(t.ok, { amount: parsed.amount, currency: parsed.currency });

  const rows: [string, string][] = [
    [t.cleaned, parsed.cleaned ? `"${parsed.cleaned}"` : "—"],
    [t.number, parsed.amount === null ? t.none : String(parsed.amount)],
    [t.currency, parsed.currency ?? t.none],
  ];

  return (
    <DemoFrame label={demoStrings[locale].demo} title={t.title}>
      <label htmlFor={`${id}-amount`} className="text-sm text-soft">{t.label}</label>
      <input
        id={`${id}-amount`}
        className="w-full min-w-0 rounded-lg border border-line bg-white px-3 py-2 font-mono text-lg"
        value={input}
        maxLength={40}
        onChange={(e) => setInput(e.target.value)}
      />
      <dl className="grid min-w-0 gap-2">
        {rows.map(([label, value]) => (
          <div key={label} className="flex min-w-0 flex-col rounded-lg bg-white px-3 py-2 sm:flex-row sm:justify-between sm:gap-4">
            <dt className="text-sm text-soft">{label}</dt>
            <dd className="break-all font-mono font-semibold">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="rounded-lg border-l-4 border-turquoise bg-white px-3 py-2" aria-live="polite">
        <span className="block text-sm text-soft">{t.result}</span>
        {result}
      </p>
    </DemoFrame>
  );
}
