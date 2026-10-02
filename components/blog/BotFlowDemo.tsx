"use client";

import { useEffect, useState } from "react";
import { format, type Locale } from "@/lib/locale";
import { DemoFrame } from "./DemoFrame";
import { demoStrings } from "./strings";

type Station = "you" | "telegram" | "bot" | "db";
const stations: Station[] = ["you", "telegram", "bot", "db"];
const icons: Record<Station, string> = { you: "📱", telegram: "✈️", bot: "🤖", db: "🗂️" };

// Where the message is during each step: from → to (equal when the bot is thinking).
const hops: [Station, Station][] = [
  ["you", "telegram"],
  ["telegram", "bot"],
  ["bot", "db"],
  ["bot", "bot"],
  ["bot", "telegram"],
  ["telegram", "you"],
];

const STEP_MS = 3200;

/** What the data looks like at each step — the same shapes the real Telegram Bot API uses. */
function payload(step: number, text: string, reply: string, rule: string): string {
  switch (step) {
    case 0:
      return `"${text}"`;
    case 1:
      return JSON.stringify({ update_id: 81546203, message: { chat: { id: 123456 }, from: { first_name: "Dilnoza" }, text } }, null, 2);
    case 2:
      return "user 123456 → { name: \"Dilnoza\", language: \"tg\", last_seen: \"yesterday\" }";
    case 3:
      return `✓ ${rule}`;
    case 4:
      return JSON.stringify({ method: "sendMessage", chat_id: 123456, text: reply }, null, 2);
    default:
      return `"${reply}"`;
  }
}

export function BotFlowDemo({ locale }: { locale: Locale }) {
  const t = demoStrings[locale];
  const f = t.flow;
  const [choice, setChoice] = useState(0);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const last = f.steps.length - 1;
  const message = f.messages[choice]!;
  const [from, to] = hops[step]!;

  useEffect(() => {
    if (!playing) return;
    if (step >= last) {
      setPlaying(false);
      return;
    }
    const id = window.setTimeout(() => setStep((s) => Math.min(s + 1, last)), STEP_MS);
    return () => window.clearTimeout(id);
  }, [playing, step, last]);

  const button = "rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold hover:border-lapis disabled:opacity-40";

  return (
    <DemoFrame label={t.demo} title={f.title}>
      <fieldset className="flex flex-wrap items-center gap-2">
        <legend className="mb-2 text-sm text-soft">{f.pick}</legend>
        {f.messages.map((m, i) => (
          <button
            key={m.text}
            type="button"
            aria-pressed={choice === i}
            onClick={() => {
              setChoice(i);
              setStep(0);
              setPlaying(false);
            }}
            className={`rounded-full px-4 py-2 font-mono text-sm ${choice === i ? "bg-lapis text-white" : "border border-line bg-white"}`}
          >
            {m.text}
          </button>
        ))}
      </fieldset>

      <ol className="grid grid-cols-4 gap-1 sm:gap-3" aria-hidden="true">
        {stations.map((s) => {
          const active = s === from || s === to;
          return (
            <li
              key={s}
              data-active={active}
              className={`flex flex-col items-center gap-1 rounded-xl border px-1 py-3 text-center text-[11px] font-semibold transition-colors motion-reduce:transition-none sm:text-sm ${
                active ? "border-saffron bg-white shadow-sm" : "border-transparent text-soft"
              }`}
            >
              <span className="text-2xl sm:text-3xl">{icons[s]}</span>
              {f.stations[s]}
            </li>
          );
        })}
      </ol>

      <div className="flex min-w-0 flex-col gap-3 rounded-xl bg-white p-4" aria-live="polite">
        <p className="text-sm font-bold text-turquoise">
          {format(f.step, { n: step + 1, total: f.steps.length })} · {f.stations[from]}
          {from !== to && ` → ${f.stations[to]}`}
        </p>
        <p>{f.steps[step]}</p>
        <pre tabIndex={0} className="overflow-x-auto rounded-lg bg-ink p-3 font-mono text-xs leading-relaxed text-paper sm:text-sm">
          <code>{payload(step, message.text, message.reply, message.rule)}</code>
        </pre>
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="button" className={button} onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
          ← {f.prev}
        </button>
        <button type="button" className={button} onClick={() => setStep((s) => Math.min(last, s + 1))} disabled={step === last}>
          {f.next} →
        </button>
        {step === last ? (
          <button type="button" className={button} onClick={() => setStep(0)}>
            ↺ {f.restart}
          </button>
        ) : (
          <button type="button" className={button} onClick={() => setPlaying((p) => !p)} aria-pressed={playing}>
            {playing ? `⏸ ${f.pause}` : `▶ ${f.play}`}
          </button>
        )}
      </div>
    </DemoFrame>
  );
}
