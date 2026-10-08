"use client";

import { useState } from "react";
import { DELAY_BY_HOUR, DELAY_STATS } from "@/lib/demos";
import { formatNumber } from "@/lib/format";
import type { Locale } from "@/lib/locale";
import { BUCKET_COLORS, City3D, type CityHover } from "./City3D";
import { DemoFrame } from "./DemoFrame";
import { demoStrings } from "./strings";
import { articleStrings } from "./strings-articles";
import { ui } from "./ui";

const fill = (t: string, v: Record<string, string | number>) => t.replace(/\{(\w+)\}/g, (_, k: string) => String(v[k] ?? ""));

export function DelayCityDemo({ locale }: { locale: Locale }) {
  const t = articleStrings[locale].speed;
  const [bucket, setBucket] = useState<number | null>(null);
  const [hover, setHover] = useState<CityHover | null>(null);
  const n = (v: number) => formatNumber(v, locale);
  const total = DELAY_STATS.all.n;
  const inBucket = (b: number) => DELAY_BY_HOUR.reduce((s, row) => s + row[b]!, 0);
  const shown = bucket === null ? total : inBucket(bucket);

  return (
    <DemoFrame label={demoStrings[locale].demo} title={t.cityTitle}>
      <p className="text-soft">{t.cityIntro}</p>
      <fieldset className="flex flex-wrap gap-2">
        <legend className="mb-2 text-sm text-soft">{t.show}</legend>
        <button type="button" aria-pressed={bucket === null} className={ui.button} onClick={() => setBucket(null)}>{t.all}</button>
        {t.buckets.map((label, b) => (
          <button key={label} type="button" aria-pressed={bucket === b} className={ui.button} onClick={() => setBucket(bucket === b ? null : b)}>
            <span aria-hidden="true" className="mr-1.5 inline-block h-2.5 w-2.5 rounded-sm" style={{ background: BUCKET_COLORS[b] }} />
            {label}
          </button>
        ))}
      </fieldset>

      <div className="relative overflow-hidden rounded-2xl bg-[radial-gradient(ellipse_at_50%_30%,#132257,#050a1f_75%)]">
        <div className="aspect-[4/3] w-full">
          <City3D
            interactive
            highlight={bucket}
            onHover={setHover}
            hourLabel={(h) => fill(t.hour, { h })}
            label={fill(t.cityLabel, { total: n(total) })}
          />
        </div>
        {hover && (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[120%] rounded-lg bg-white px-3 py-2 text-sm text-[#151827] shadow-lg"
            style={{ left: hover.x, top: hover.y }}
          >
            <b>{fill(t.tip, { hour: fill(t.hour, { h: hover.hour }), next: fill(t.hour, { h: (hover.hour + 1) % 24 }) })}</b>
            <br />
            {t.buckets[hover.bucket]}: <b>{n(hover.count)}</b>
          </div>
        )}
        <p className="pointer-events-none absolute bottom-2 left-0 right-0 text-center text-xs text-white/60">{t.drag}</p>
      </div>

      <div aria-live="polite" className="grid gap-2 sm:grid-cols-3">
        <p className={ui.card}><span className={ui.label}>{bucket === null ? t.all : t.buckets[bucket]}</span><b className="text-2xl tabular-nums">{n(shown)}</b></p>
        <p className={ui.card}><span className={ui.label}>{t.share}</span><b className="text-2xl tabular-nums">{Math.round((shown / total) * 100)}%</b></p>
        <p className={ui.card}><span className={ui.label}>{t.median}</span><b className="text-2xl tabular-nums">{fill(t.min, { n: formatNumber(DELAY_STATS.all.median, locale, { maximumFractionDigits: 0 }) })}</b></p>
      </div>
      <p className="text-sm text-soft">{t.source}</p>
    </DemoFrame>
  );
}
