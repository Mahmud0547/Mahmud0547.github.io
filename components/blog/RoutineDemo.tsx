"use client";

import { useId, useState } from "react";
import { packages } from "@/content/site";
import { routineCost } from "@/lib/demos";
import { formatNumber } from "@/lib/format";
import type { Locale } from "@/lib/locale";
import { DemoFrame } from "./DemoFrame";
import { demoStrings } from "./strings";
import { articleStrings } from "./strings-articles";
import { ui } from "./ui";

const fill = (t: string, vars: Record<string, string>) => t.replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? "");

/** The "AI Bot + Database" package: the usual choice for a business routine. */
const botPrice = packages[1].price;

export function RoutineDemo({ locale }: { locale: Locale }) {
  const t = articleStrings[locale].routine;
  const id = useId();
  const [preset, setPreset] = useState(0);
  const [perDay, setPerDay] = useState(t.presets[0].perDay);
  const [minutes, setMinutes] = useState(t.presets[0].minutes);
  const [checkMinutes, setCheckMinutes] = useState(t.presets[0].checkMinutes);
  const [rate, setRate] = useState(10);

  const choose = (i: number) => {
    setPreset(i);
    setPerDay(t.presets[i].perDay);
    setMinutes(t.presets[i].minutes);
    setCheckMinutes(t.presets[i].checkMinutes);
  };
  const r = routineCost({ perDay, minutes, checkMinutes, hourlyRate: rate }, botPrice);
  const n = (value: number, digits = 0) => formatNumber(value, locale, { maximumFractionDigits: digits });
  const fields = [
    { key: "perDay", label: t.perDay, value: perDay, set: setPerDay, min: 1, max: 200, step: 1 },
    { key: "minutes", label: t.minutes, value: minutes, set: setMinutes, min: 0.5, max: 60, step: 0.5 },
    { key: "check", label: t.checkMinutes, value: checkMinutes, set: setCheckMinutes, min: 0, max: 30, step: 0.5 },
    { key: "rate", label: t.rate, value: rate, set: setRate, min: 1, max: 100, step: 1 },
  ];

  return (
    <DemoFrame label={demoStrings[locale].demo} title={t.title}>
      <p className="text-soft">{t.intro}</p>
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm text-soft">{t.examples}</legend>
        <div className="flex flex-wrap gap-2">
          {t.presets.map((p, i) => (
            <button key={p.name} type="button" aria-pressed={preset === i} onClick={() => choose(i)} className={ui.button}>
              {p.name}
            </button>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((f) => (
          <label key={f.key} htmlFor={`${id}-${f.key}`} className="flex flex-col gap-1 text-sm">
            <span className="flex justify-between gap-2">
              {f.label} <b className="tabular-nums">{n(f.value, 1)}</b>
            </span>
            <input
              id={`${id}-${f.key}`}
              type="range"
              min={f.min}
              max={f.max}
              step={f.step}
              value={f.value}
              onChange={(e) => {
                setPreset(-1);
                f.set(Number(e.target.value));
              }}
              className="accent-[var(--color-link)]"
            />
          </label>
        ))}
      </div>
      <div aria-live="polite" className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <p className={ui.card}>
            <span className={ui.label}>{t.byHand}</span>
            <b className="text-2xl tabular-nums text-danger">{fill(t.hoursMonth, { n: n(r.hoursBefore) })}</b>
          </p>
          <p className={ui.card}>
            <span className={ui.label}>{t.withBot}</span>
            <b className="text-2xl tabular-nums text-success">{fill(t.hoursMonth, { n: n(r.hoursAfter) })}</b>
          </p>
        </div>
        <p className="rounded-xl bg-success-soft px-4 py-3 font-semibold text-success">
          {r.paybackDays === null
            ? t.nothing
            : `${fill(t.saved, { hours: n(r.hoursSaved), money: n(r.moneySaved) })} ${fill(t.payback, { price: n(botPrice), days: n(Math.max(1, Math.ceil(r.paybackDays))) })}`}
        </p>
      </div>
    </DemoFrame>
  );
}
