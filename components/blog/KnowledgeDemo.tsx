"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { bestCard, rankCards, wordKeys } from "@/lib/demos";
import type { Locale } from "@/lib/locale";
import { DemoFrame } from "./DemoFrame";
import { demoStrings } from "./strings";
import { lessonStrings } from "./strings-lessons";
import { ui } from "./ui";

const fill = (t: string, v: Record<string, string | number>) => t.replace(/\{(\w+)\}/g, (_, k: string) => String(v[k] ?? ""));

// Timeline of one answer, in milliseconds after "Ask".
const WORDS_END = 700;
const BARS_END = 1700;
const PICK_END = 2300;
const TYPE_MS = 28;

const sameWord = (a: string, b: string) => a === b || (Math.min(a.length, b.length) >= 4 && (a.startsWith(b) || b.startsWith(a)));

/** Elapsed ms of the current run, ticking with requestAnimationFrame until `until`; jumps to the end when motion is reduced. */
function useTimeline(run: number, until: number) {
  const [now, setNow] = useState(0);
  useEffect(() => {
    if (!run) return;
    const start = performance.now();
    const instant = window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.hasAttribute("data-lite");
    let raf = 0;
    const tick = () => {
      const t = instant ? until : performance.now() - start;
      setNow(t);
      if (t < until) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run, until]);
  return run ? now : -1;
}

export function KnowledgeDemo({ locale }: { locale: Locale }) {
  const t = lessonStrings[locale].knowledge;
  const id = useId();
  const [price, setPrice] = useState(35);
  const [draft, setDraft] = useState("");
  const [question, setQuestion] = useState<string | null>(null);
  const [run, setRun] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const cards = useMemo(() => t.cards.map((c) => ({ ...c, text: fill(c.text, { price }) })), [t, price]);
  const ranked = useMemo(() => (question ? rankCards(question, cards, t.stop) : []), [question, cards, t.stop]);
  const winner = question ? bestCard(ranked) : null;
  const winnerCard = cards.find((c) => c.id === winner);
  const answer = winnerCard ? winnerCard.text : t.unknown;
  const until = PICK_END + answer.length * TYPE_MS + 200;
  const ms = useTimeline(run, until);

  const ask = (q: string) => {
    if (!q.trim()) return;
    setQuestion(q.trim());
    setRun((r) => r + 1);
  };

  const keys = question ? wordKeys(question, t.stop) : [];
  const matchedAll = new Set(ranked.flatMap((r) => r.words));
  const step = ms < 0 ? -1 : ms < WORDS_END ? 0 : ms < BARS_END ? 1 : 2;
  const typed = ms >= PICK_END ? answer.slice(0, Math.floor((ms - PICK_END) / TYPE_MS)) : "";

  return (
    <DemoFrame label={demoStrings[locale].demo} title={t.title}>
      <p className="text-soft">{t.intro}</p>

      {/* question */}
      <div className="flex flex-wrap gap-2">
        {t.presets.map((p) => (
          <button key={p} type="button" className={ui.button} aria-pressed={question === p} onClick={() => ask(p)}>
            {p}
          </button>
        ))}
      </div>
      <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); ask(draft); }}>
        <label htmlFor={`${id}-q`} className="sr-only">{t.placeholder}</label>
        <input id={`${id}-q`} ref={inputRef} className={ui.field} value={draft} placeholder={t.placeholder} onChange={(e) => setDraft(e.target.value)} />
        <button type="submit" className={ui.primary}>{t.ask}</button>
      </form>

      {/* steps */}
      <ol className="grid grid-cols-3 gap-2 text-center text-xs font-bold uppercase tracking-[0.08em]">
        {t.steps.map((s, i) => (
          <li key={s} className={`rounded-full px-2 py-1.5 transition-colors duration-300 ${step >= i ? "bg-lapis text-white" : "bg-tint text-soft"}`}>{i + 1}. {s}</li>
        ))}
      </ol>

      {/* 1 — the question breaks into words */}
      {question && (
        <div className="flex min-h-12 flex-wrap items-center gap-2" aria-label={t.steps[0]}>
          {(question.match(/[\p{L}\d]+/gu) ?? []).map((w, i) => {
            const key = w.toLowerCase().replace(/ё/g, "е").slice(0, 5);
            const isKey = keys.some((k) => k === key);
            const hit = isKey && [...matchedAll].some((m) => sameWord(m, key));
            const p = Math.max(0, Math.min(1, (ms - i * 70) / 260));
            return (
              <span key={`${w}${i}`} style={{ opacity: p, transform: `translateY(${(1 - p) * 14}px) scale(${0.8 + 0.2 * p})` }}
                className={`rounded-lg px-2.5 py-1 font-semibold ${!isKey ? "text-soft line-through decoration-2 opacity-60" : hit && ms >= WORDS_END ? "bg-saffron text-on-accent shadow-[0_0_18px_rgba(224,165,38,0.6)]" : "bg-tint text-ink"}`}>
                {w}
              </span>
            );
          })}
        </div>
      )}

      {/* 2 — cards and their match bars */}
      <div className="flex items-center justify-between gap-3">
        <p className={ui.label}>{t.kb}</p>
        <label htmlFor={`${id}-price`} className="flex items-center gap-2 text-sm">
          {t.price}
          <input id={`${id}-price`} type="number" min={1} max={999} value={price} onChange={(e) => setPrice(Math.max(1, Number(e.target.value) || 1))} className={`${ui.field} w-24`} />
        </label>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {cards.map((c, i) => {
          const r = ranked.find((x) => x.id === c.id);
          const grow = Math.max(0, Math.min(1, (ms - WORDS_END - i * 120) / 600));
          const score = r ? r.score * grow : 0;
          const isWinner = c.id === winner && ms >= BARS_END;
          const dim = winner !== null && ms >= BARS_END && !isWinner;
          return (
            <div key={c.id} className={`relative flex flex-col gap-2 rounded-xl border-2 bg-surface p-4 transition-all duration-500 ${isWinner ? "-translate-y-1 border-saffron shadow-[0_12px_32px_rgba(224,165,38,0.35)]" : "border-transparent"} ${dim ? "opacity-45" : ""}`}>
              <p className="font-bold">{c.title}</p>
              <p className="text-sm leading-relaxed">
                {c.text.split(/(\s+)/).map((tok, k) => {
                  const key = tok.toLowerCase().replace(/ё/g, "е").replace(/[^\p{L}\d]/gu, "").slice(0, 5);
                  const lit = key.length >= 3 && r?.words.some((m) => sameWord(m, key)) && ms >= WORDS_END + 200;
                  return <span key={k} className={lit ? "rounded bg-saffron/40 px-0.5 font-semibold" : undefined}>{tok}</span>;
                })}
              </p>
              <div className="h-2 overflow-hidden rounded-full bg-tint" aria-hidden="true">
                <div className={`h-full rounded-full ${isWinner ? "bg-saffron" : "bg-lapis"}`} style={{ width: `${score * 100}%` }} />
              </div>
              {question && ms >= WORDS_END && <p className="text-xs text-soft tabular-nums">{fill(t.match, { n: Math.round(score * 100) })}</p>}
            </div>
          );
        })}
      </div>

      {/* 3 — the answer */}
      {question && ms >= BARS_END && (
        <div aria-live="polite" className="flex items-start gap-3">
          <div aria-hidden="true" className="relative mt-1 size-11 shrink-0 rounded-full"
            style={{ background: "conic-gradient(from 0deg, var(--color-saffron), var(--color-turquoise), var(--color-lapis), var(--color-saffron))", transform: `rotate(${ms / 6}deg)`, boxShadow: "0 0 24px rgba(224,165,38,0.45)" }}>
            <div className="absolute inset-1.5 rounded-full bg-surface" />
          </div>
          <div className="flex min-w-0 flex-col gap-1.5">
            <p className={`rounded-2xl rounded-tl-sm px-4 py-3 font-medium ${winner ? "bg-success-soft text-ink" : "bg-danger-soft text-ink"}`}>
              {typed || " "}
              {ms < until - 200 && ms >= PICK_END && <span className="ml-0.5 inline-block w-2 animate-pulse">▍</span>}
            </p>
            {ms >= until - 200 && (
              <p className="text-sm text-soft">{winnerCard ? fill(t.source, { card: winnerCard.title }) : t.unknownWhy}</p>
            )}
          </div>
        </div>
      )}

      <p className="text-sm text-soft">{t.note}</p>
    </DemoFrame>
  );
}
