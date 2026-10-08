"use client";

import { useEffect, useId, useState } from "react";
import { checkEvery, waitsUntilCheck } from "@/lib/demos";
import { formatNumber } from "@/lib/format";
import type { Locale } from "@/lib/locale";
import { DemoFrame } from "./DemoFrame";
import { prefersStill } from "./Globe";
import { demoStrings } from "./strings";
import { articleStrings } from "./strings-articles";
import { ui } from "./ui";

const fill = (t: string, v: Record<string, string | number>) => t.replace(/\{(\w+)\}/g, (_, k: string) => String(v[k] ?? ""));

// Three hours of a news morning: when 14 stories appear in the feed (minutes from the start).
const STORIES = [7, 19, 26, 41, 58, 63, 77, 92, 101, 118, 124, 139, 151, 167];
const SPAN = 180, W = 640, H = 150, PAD = 20;
const X = (m: number) => PAD + (m / SPAN) * (W - 2 * PAD);
const SWEEP_MS = 6000;
const PRESETS = [5, 15, 30, 60];

export function CheckEveryDemo({ locale }: { locale: Locale }) {
  const t = articleStrings[locale].speed;
  const id = useId();
  const [every, setEvery] = useState(30);
  const [run, setRun] = useState(0);
  const [head, setHead] = useState<number | null>(null); // playhead in minutes

  const r = checkEvery(every);
  const waits = waitsUntilCheck(STORIES, every);
  const sampleAvg = waits.reduce((a, b) => a + b, 0) / waits.length;
  const n = (v: number, d = 0) => formatNumber(v, locale, { maximumFractionDigits: d });
  const checks = Array.from({ length: Math.floor(SPAN / every) + 1 }, (_, i) => i * every).filter((m) => m <= SPAN);

  useEffect(() => {
    if (!run) return;
    let raf = 0;
    if (prefersStill()) {
      raf = requestAnimationFrame(() => setHead(SPAN));
      return () => cancelAnimationFrame(raf);
    }
    const t0 = performance.now();
    const tick = () => {
      const m = Math.min(SPAN, ((performance.now() - t0) / SWEEP_MS) * SPAN);
      setHead(m);
      if (m < SPAN) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run]);

  const now = head ?? SPAN;
  const caught = STORIES.filter((s, i) => s + waits[i]! <= now).length;

  return (
    <DemoFrame label={demoStrings[locale].demo} title={t.checkTitle}>
      <p className="text-soft">{t.checkIntro}</p>
      <div className="flex flex-col gap-2">
        <label htmlFor={`${id}-every`} className="flex justify-between text-sm">
          <span>{t.every}</span>
          <b className="tabular-nums">{fill(t.min, { n: every })}</b>
        </label>
        <input id={`${id}-every`} type="range" min={1} max={60} value={every} onChange={(e) => { setEvery(Number(e.target.value)); setHead(null); }} />
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button key={p} type="button" aria-pressed={every === p} className={ui.button} onClick={() => { setEvery(p); setHead(null); }}>{fill(t.min, { n: p })}</button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl bg-[linear-gradient(180deg,#0d1640,#050a1f)] p-2">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={fill(t.timelineLabel, { every, avg: n(sampleAvg) })}>
          <line x1={PAD} x2={W - PAD} y1={H - 34} y2={H - 34} stroke="rgba(200,215,255,0.35)" strokeWidth={2} />
          {[0, 60, 120, 180].map((m) => (
            <text key={m} x={X(m)} y={H - 10} textAnchor={m === 0 ? "start" : m === SPAN ? "end" : "middle"} fontSize={13} fill="rgba(200,215,255,0.7)">{fill(t.plusMin, { n: m })}</text>
          ))}
          {/* checks */}
          {checks.map((m) => {
            const lit = now >= m;
            return (
              <g key={m}>
                <line x1={X(m)} x2={X(m)} y1={18} y2={H - 34} stroke={lit ? "#3FD3B4" : "rgba(63,211,180,0.3)"} strokeWidth={every <= 5 ? 1.5 : 3} strokeDasharray={lit ? undefined : "4 4"} />
                {every >= 10 && <text x={X(m)} y={12} textAnchor="middle" fontSize={16}>🤖</text>}
              </g>
            );
          })}
          {/* stories and their waits */}
          {STORIES.map((s, i) => {
            const got = s + waits[i]!;
            const y = 40 + (i % 4) * 18;
            const appeared = now >= s, done = now >= got;
            return (
              <g key={s} opacity={appeared ? 1 : 0.25}>
                <line x1={X(s)} x2={X(Math.min(now, got))} y1={y} y2={y} stroke="#E0A526" strokeWidth={4} strokeLinecap="round" opacity={appeared ? 0.75 : 0} />
                <circle cx={X(s)} cy={y} r={6} fill={done ? "#3FD3B4" : "#E0A526"} stroke="#fff" strokeWidth={1.5} />
              </g>
            );
          })}
          {head !== null && head < SPAN && <line x1={X(head)} x2={X(head)} y1={14} y2={H - 30} stroke="#fff" strokeWidth={2} />}
        </svg>
        <p className="px-2 pb-1 text-xs text-white/70">{t.legend}</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" className={ui.primary} onClick={() => { setHead(0); setRun((x) => x + 1); }}>▶ {t.play}</button>
        {head !== null && <span aria-live="polite" className="text-sm tabular-nums text-soft">{fill(t.caught, { n: caught, total: STORIES.length })}</span>}
      </div>

      <div aria-live="polite" className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <p className={ui.card}><span className={ui.label}>{t.avgWait}</span><b className="text-2xl tabular-nums">{fill(t.min, { n: n(r.averageWait, 1) })}</b></p>
        <p className={ui.card}><span className={ui.label}>{t.worstWait}</span><b className="text-2xl tabular-nums">{fill(t.min, { n: r.worstWait })}</b></p>
        <p className={ui.card}><span className={ui.label}>{t.perDay}</span><b className="text-2xl tabular-nums">{n(r.checksPerDay)}</b></p>
        <p className={ui.card}><span className={ui.label}>{t.estMedian}</span><b className="text-2xl tabular-nums">≈ {fill(t.min, { n: n(r.estimatedMedian) })}</b></p>
      </div>
      <p className="text-sm text-soft">{t.estNote}</p>
    </DemoFrame>
  );
}
