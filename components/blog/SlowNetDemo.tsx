"use client";

import { useState, useSyncExternalStore } from "react";
import { homePage, loadSeconds, partsFor, type Network } from "@/lib/demos";
import type { Locale } from "@/lib/locale";
import { DemoFrame } from "./DemoFrame";
import { demoStrings } from "./strings";
import { lessonStrings } from "./strings-lessons";
import { ui } from "./ui";

const order: Network[] = ["4g", "3g", "2g"];
const format = (t: string, vars: Record<string, string | number>) => t.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k]));

type Connection = { effectiveType?: string; saveData?: boolean };
const noSubscribe = () => () => {};
/** What this browser reports right now; "" while rendering on the server. */
function useConnection(): Connection | null | "" {
  return useSyncExternalStore<Connection | null | "">(
    noSubscribe,
    () => (navigator as Navigator & { connection?: Connection }).connection ?? null,
    () => "",
  );
}

export function SlowNetDemo({ locale }: { locale: Locale }) {
  const t = lessonStrings[locale].slowNet;
  const number = new Intl.NumberFormat(locale === "tj" ? "tg" : locale, { maximumFractionDigits: 1 });
  const [network, setNetwork] = useState<Network>("3g");
  const connection = useConnection();

  const full = loadSeconds(homePage, network, false);
  const lite = loadSeconds(homePage, network, true);
  const kb = (lite: boolean) => partsFor(homePage, lite).reduce((sum, p) => sum + p.kb, 0);
  const savedKb = kb(false) - kb(true);
  const bars = [
    { label: t.full, seconds: full, tone: "bg-lapis" },
    { label: t.lite, seconds: lite, tone: "bg-turquoise" },
  ];

  return (
    <DemoFrame label={demoStrings[locale].demo} title={t.title}>
      <p className="text-soft">{t.intro}</p>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm text-soft">{t.network}</legend>
        <div className="flex flex-wrap gap-2">
          {order.map((n) => (
            <button key={n} type="button" aria-pressed={network === n} onClick={() => setNetwork(n)} className={ui.button}>
              {t.networks[n]}
            </button>
          ))}
        </div>
        <p className="text-sm text-soft">{t.speeds[network]}</p>
      </fieldset>

      <table className="w-full text-left text-sm">
        <thead>
          <tr className="text-soft">
            <td />
            <th scope="col" className="py-1 pr-3 font-semibold">{format(t.kb, { n: "" }).trim()}</th>
            <th scope="col" className="py-1 font-semibold">{t.inLite}</th>
          </tr>
        </thead>
        <tbody>
          {homePage.map((part) => (
            <tr key={part.id} className="border-t border-line">
              <th scope="row" className="py-2 pr-3 font-medium">{t.parts[part.id]}</th>
              <td className="py-2 pr-3 tabular-nums">{number.format(part.kb)}</td>
              <td className={`py-2 font-semibold ${part.inLite ? "text-success" : "text-link"}`}>{part.inLite ? t.loads : t.waits}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div aria-live="polite" className="flex flex-col gap-3">
        {bars.map((bar) => (
          <div key={bar.label} className="flex flex-col gap-1">
            <div className="flex justify-between text-sm font-semibold">
              <span>{bar.label}</span>
              <span className="tabular-nums">{format(t.seconds, { n: number.format(bar.seconds) })}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-tint">
              <div className={`h-full rounded-full ${bar.tone}`} style={{ width: `${(bar.seconds / full) * 100}%` }} />
            </div>
          </div>
        ))}
        <p className={ui.card}>{format(t.saved, { n: number.format(full / lite), kb: number.format(savedKb) })}</p>
      </div>

      {connection !== "" && (
        <p className="text-sm text-soft">
          {connection?.effectiveType
            ? format(t.yours, { type: connection.effectiveType.toUpperCase(), saver: connection.saveData ? t.saver : "" })
            : t.unknown}
        </p>
      )}
    </DemoFrame>
  );
}
