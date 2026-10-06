"use client";

import { useEffect, useId, useRef, useState } from "react";
import { NEWS_BY_UTC_HOUR, isWorkingHour, outsideHours, toLocalHours } from "@/lib/demos";
import { formatNumber } from "@/lib/format";
import type { Locale } from "@/lib/locale";
import { DemoFrame } from "./DemoFrame";
import { demoStrings } from "./strings";
import { articleStrings } from "./strings-articles";
import { ui } from "./ui";

const fill = (t: string, v: Record<string, string | number>) => t.replace(/\{(\w+)\}/g, (_, k: string) => String(v[k] ?? ""));
const SIZE = 520, C = SIZE / 2, INNER = 118, MAXLEN = 104, ARC = 238;
const DAY_MS = 8000;

const angle = (hour: number) => (hour / 24) * Math.PI * 2 - Math.PI / 2;
const point = (r: number, hour: number) => [C + r * Math.cos(angle(hour)), C + r * Math.sin(angle(hour))] as const;

function arcPath(r: number, from: number, to: number) {
  const span = ((to - from + 24) % 24) || 24;
  const [x1, y1] = point(r, from);
  const [x2, y2] = point(r, from + span);
  return `M ${x1} ${y1} A ${r} ${r} 0 ${span > 12 ? 1 : 0} 1 ${x2} ${y2}`;
}

const reduced = () =>
  typeof window !== "undefined" && (window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.hasAttribute("data-lite"));

export function NightClockDemo({ locale }: { locale: Locale }) {
  const t = articleStrings[locale].clock;
  const id = useId();
  const [zone, setZone] = useState<"dubai" | "dushanbe">("dubai");
  const [start, setStart] = useState(9);
  const [end, setEnd] = useState(18);
  const [bot, setBot] = useState(false);
  const [playAt, setPlayAt] = useState<number | null>(null);
  const [hand, setHand] = useState<number | null>(null); // hours 0..24 while playing
  const [shown, setShown] = useState(0); // animated percentage
  const drag = useRef<"start" | "end" | null>(null);
  const svg = useRef<SVGSVGElement>(null);

  const counts = toLocalHours(NEWS_BY_UTC_HOUR, zone === "dubai" ? 4 : 5);
  const max = Math.max(...counts);
  const { outside, total, share } = outsideHours(counts, start, end);
  const target = bot ? 0 : Math.round(share * 100);
  const n = (v: number) => formatNumber(v, locale);

  // The big number counts towards its new value.
  useEffect(() => {
    let raf = 0;
    if (reduced()) {
      raf = requestAnimationFrame(() => setShown(target));
      return () => cancelAnimationFrame(raf);
    }
    const from = shown;
    const t0 = performance.now();
    const tick = () => {
      const p = Math.min(1, (performance.now() - t0) / 500);
      setShown(Math.round(from + (target - from) * (1 - (1 - p) ** 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  // "Live through a day": the hand sweeps 24 hours.
  useEffect(() => {
    if (playAt === null) return;
    let raf = 0;
    if (reduced()) {
      raf = requestAnimationFrame(() => setHand(24));
      return () => cancelAnimationFrame(raf);
    }
    const tick = () => {
      const h = Math.min(24, ((performance.now() - playAt) / DAY_MS) * 24);
      setHand(h);
      if (h < 24) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playAt]);

  const offTonight = hand === null ? 0 : counts.reduce((s, c, h) => s + (h < hand && !isWorkingHour(h, start, end) ? c : 0), 0);

  const hourFromPointer = (e: React.PointerEvent) => {
    const box = svg.current!.getBoundingClientRect();
    const x = ((e.clientX - box.left) / box.width) * SIZE - C;
    const y = ((e.clientY - box.top) / box.height) * SIZE - C;
    return (Math.round(((Math.atan2(y, x) + Math.PI / 2 + Math.PI * 2) % (Math.PI * 2)) / (Math.PI * 2) * 24) % 24);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const h = hourFromPointer(e);
    if (drag.current === "start" && h !== end) setStart(h);
    if (drag.current === "end" && h !== start) setEnd(h);
  };

  const handle = (which: "start" | "end", hour: number) => {
    const [x, y] = point(ARC, hour);
    return (
      <circle cx={x} cy={y} r={15} fill="var(--color-saffron)" stroke="var(--color-surface)" strokeWidth={4} className="cursor-grab"
        onPointerDown={(e) => { drag.current = which; (e.target as Element).setPointerCapture(e.pointerId); }} />
    );
  };

  return (
    <DemoFrame label={demoStrings[locale].demo} title={t.title}>
      <p className="text-soft">{t.intro}</p>
      <fieldset className="flex flex-wrap items-center gap-2">
        <legend className="mb-2 text-sm text-soft">{t.zone}</legend>
        {(["dubai", "dushanbe"] as const).map((z) => (
          <button key={z} type="button" aria-pressed={zone === z} className={ui.button} onClick={() => setZone(z)}>{t.zones[z]}</button>
        ))}
      </fieldset>

      <div className="relative mx-auto w-full max-w-[520px]">
        <svg ref={svg} viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full touch-none select-none" onPointerMove={onMove} onPointerUp={() => (drag.current = null)}
          role="img" aria-label={`${Math.round(share * 100)}% ${t.outside}. ${fill(t.count, { outside: n(outside), total: n(total) })}`}>
          <circle cx={C} cy={C} r={INNER - 8} fill="var(--color-tint)" />
          {counts.map((count, h) => {
            const work = isWorkingHour(h, start, end);
            const mid = h + 0.5;
            const len = 14 + (count / max) * MAXLEN;
            const [x1, y1] = point(INNER, mid);
            const [x2, y2] = point(INNER + len, mid);
            const lit = hand === null || h < hand;
            const color = work ? "var(--color-link)" : bot ? "var(--color-turquoise)" : "var(--color-danger-line)";
            return (
              <line key={h} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={13} strokeLinecap="round"
                style={{ opacity: lit ? 1 : 0.18, transition: "stroke 400ms ease, opacity 200ms ease" }} />
            );
          })}
          {[0, 6, 12, 18].map((h) => {
            const [x, y] = point(INNER - 30, h);
            return <text key={h} x={x} y={y + 6} textAnchor="middle" fontSize={17} fontWeight={700} fill="var(--color-soft)">{fill(t.hour, { h })}</text>;
          })}
          <path d={arcPath(ARC, start, end)} fill="none" stroke="var(--color-saffron)" strokeWidth={10} strokeLinecap="round" opacity={0.9} />
          {handle("start", start)}
          {handle("end", end)}
          {hand !== null && hand < 24 && (() => {
            const [x, y] = point(INNER + MAXLEN + 18, hand);
            return <line x1={C} y1={C} x2={x} y2={y} stroke="var(--color-ink)" strokeWidth={4} strokeLinecap="round" />;
          })()}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center" aria-hidden="true">
          <p className="text-4xl font-extrabold tabular-nums sm:text-5xl" style={{ color: bot ? "var(--color-success)" : "var(--color-danger)" }}>{bot ? "24/7" : `${shown}%`}</p>
          <p className="max-w-[120px] text-xs font-semibold text-soft sm:max-w-[150px] sm:text-sm">{bot ? t.covered : t.outside}</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label htmlFor={`${id}-from`} className="flex flex-col gap-1 text-sm">
          <span className="flex justify-between">{t.from} <b className="tabular-nums">{fill(t.hour, { h: start })}</b></span>
          <input id={`${id}-from`} type="range" min={0} max={23} value={start} onChange={(e) => Number(e.target.value) !== end && setStart(Number(e.target.value))} />
        </label>
        <label htmlFor={`${id}-to`} className="flex flex-col gap-1 text-sm">
          <span className="flex justify-between">{t.to} <b className="tabular-nums">{fill(t.hour, { h: end })}</b></span>
          <input id={`${id}-to`} type="range" min={0} max={23} value={end} onChange={(e) => Number(e.target.value) !== start && setEnd(Number(e.target.value))} />
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="button" className={ui.primary} onClick={() => { setHand(0); setPlayAt(performance.now()); }}>
          ▶ {hand === 24 ? t.replay : t.play}
        </button>
        <button type="button" className={ui.button} aria-pressed={bot} onClick={() => setBot((b) => !b)}>{t.bot}</button>
      </div>

      <div aria-live="polite" className="grid gap-2 sm:grid-cols-2">
        <p className={ui.card}><b>{fill(t.count, { outside: n(outside), total: n(total) })}</b><span className={ui.label}>{Math.round(share * 100)}% {t.outside}</span></p>
        {hand !== null && <p className={ui.card}><b className="tabular-nums">{fill(t.tonight, { n: n(offTonight) })}</b></p>}
      </div>
      <p className="text-sm text-soft">{t.source}</p>
    </DemoFrame>
  );
}
