"use client";

import { useId, useState } from "react";
import { toSomoni } from "@/lib/demos";
import type { Locale } from "@/lib/locale";
import { DemoFrame } from "./DemoFrame";
import { demoStrings } from "./strings";
import { lessonStrings } from "./strings-lessons";
import { ui } from "./ui";

// Official National Bank of Tajikistan rates for 2 October 2026 (nbt.tj, via the Kursi Tojik API): somoni per `nominal` units.
const rates = [
  { code: "KZT", nominal: 10, value: 0.2089 },
  { code: "UZS", nominal: 100, value: 0.0782 },
  { code: "KGS", nominal: 10, value: 1.0559 },
  { code: "USD", nominal: 1, value: 9.2331 },
  { code: "RUB", nominal: 1, value: 0.1105 },
];

const number = (value: number, locale: Locale) =>
  value.toLocaleString(locale === "en" ? "en-US" : "ru-RU", { maximumFractionDigits: 4 });

export function NominalDemo({ locale }: { locale: Locale }) {
  const t = lessonStrings[locale].nominal;
  const id = useId();
  const [code, setCode] = useState("KZT");
  const [amount, setAmount] = useState(1000);
  const rate = rates.find((r) => r.code === code)!;
  const safe = Number.isFinite(amount) && amount >= 0 ? amount : 0;
  const fmt = (v: number) => number(v, locale);

  return (
    <DemoFrame label={demoStrings[locale].demo} title={t.title}>
      <p>{t.intro}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm" htmlFor={`${id}-cur`}>
          {t.currency}
          <select id={`${id}-cur`} className={ui.field} value={code} onChange={(e) => setCode(e.target.value)}>
            {rates.map((r) => <option key={r.code} value={r.code}>{r.code}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm" htmlFor={`${id}-amt`}>
          {t.amount}
          <input id={`${id}-amt`} type="number" min={0} max={100000000} inputMode="decimal" className={ui.field} value={amount} onChange={(e) => setAmount(e.target.valueAsNumber)} />
        </label>
      </div>
      <div className={ui.card}>
        <p className={ui.label}>{t.published}</p>
        <p className="font-mono text-lg font-bold">{rate.nominal} {rate.code} = {fmt(rate.value)} TJS</p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2" aria-live="polite">
        <div className="rounded-xl border-2 border-[#c2410c] bg-white p-4">
          <p className="text-sm font-semibold text-[#9a3412]">✗ {t.wrong}</p>
          <p className="font-mono">{fmt(safe)} × {fmt(rate.value)} = {fmt(safe * rate.value)} TJS</p>
        </div>
        <div className="rounded-xl border-2 border-turquoise bg-white p-4">
          <p className="text-sm font-semibold text-[#0d5e5c]">✓ {t.right}</p>
          <p className="font-mono">{fmt(safe)} × {fmt(rate.value)} ÷ {rate.nominal} = {fmt(toSomoni(safe, rate.value, rate.nominal))} TJS</p>
        </div>
      </div>
      <p className="text-sm text-soft">{t.note}</p>
    </DemoFrame>
  );
}
