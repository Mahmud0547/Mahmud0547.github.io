"use client";

import { useId, useState, type FormEvent } from "react";
import { matchRule, pythonCode, type Rule } from "@/lib/demos";
import { format, type Locale } from "@/lib/locale";
import { DemoFrame } from "./DemoFrame";
import { demoStrings } from "./strings";

const MAX_RULES = 5;
const MAX_CHAT = 8;

interface ChatLine {
  id: number;
  from: "user" | "bot";
  text: string;
  note?: string;
}

export function BotPlayground({ locale }: { locale: Locale }) {
  const t = demoStrings[locale].playground;
  const id = useId();
  const [rules, setRules] = useState<Rule[]>(t.rules);
  const [fallback, setFallback] = useState(t.defaultFallback);
  const [draft, setDraft] = useState("");
  const [chat, setChat] = useState<ChatLine[]>([]);

  const field = "w-full min-w-0 rounded-lg border border-line bg-white px-3 py-2 text-base";

  function updateRule(index: number, patch: Partial<Rule>) {
    setRules((current) => current.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }

  function send(event: FormEvent) {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    const hit = matchRule(rules, text);
    const reply = hit >= 0 ? rules[hit]!.reply : fallback;
    const note = hit >= 0 ? format(t.matched, { n: hit + 1 }) : t.noMatch;
    const now = Date.now();
    setChat((c) => [...c, { id: now, from: "user" as const, text }, { id: now + 1, from: "bot" as const, text: reply, note }].slice(-MAX_CHAT));
    setDraft("");
  }

  return (
    <DemoFrame label={demoStrings[locale].demo} title={t.title}>
      <fieldset className="flex min-w-0 flex-col gap-3">
        <legend className="mb-2 text-sm text-soft">{t.rulesLabel}</legend>
        {rules.map((rule, i) => (
          <div key={i} className="flex min-w-0 flex-col gap-2 rounded-xl bg-white p-3 sm:flex-row sm:items-end">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-saffron text-sm font-bold text-ink" aria-hidden="true">
              {i + 1}
            </span>
            <label className="flex min-w-0 flex-1 flex-col gap-1 text-sm">
              {t.when}
              <input className={field} value={rule.when} maxLength={30} onChange={(e) => updateRule(i, { when: e.target.value })} />
            </label>
            <label className="flex min-w-0 flex-[2] flex-col gap-1 text-sm">
              {t.reply}
              <input className={field} value={rule.reply} maxLength={120} onChange={(e) => updateRule(i, { reply: e.target.value })} />
            </label>
            <button
              type="button"
              className="self-end rounded-full px-3 py-2 text-sm text-soft hover:text-ink"
              aria-label={format(t.remove, { n: i + 1 })}
              onClick={() => setRules((current) => current.filter((_, j) => j !== i))}
            >
              ✕
            </button>
          </div>
        ))}
        <button
          type="button"
          className="self-start rounded-full border border-dashed border-lapis px-4 py-2 text-sm font-semibold text-lapis disabled:opacity-40"
          disabled={rules.length >= MAX_RULES}
          onClick={() => setRules((current) => [...current, { when: "", reply: "" }])}
        >
          + {t.add}
        </button>
        <label className="flex min-w-0 flex-col gap-1 text-sm">
          {t.fallback}
          <input className={field} value={fallback} maxLength={120} onChange={(e) => setFallback(e.target.value)} />
        </label>
      </fieldset>

      <div className="flex min-w-0 flex-col gap-3 rounded-xl bg-[#e6ebf5] p-3">
        <p className="text-sm font-bold">{t.chat}</p>
        <ul className="flex min-h-24 flex-col gap-2" aria-live="polite">
          {chat.map((line) => (
            <li key={line.id} className={`flex max-w-[85%] flex-col gap-0.5 ${line.from === "user" ? "self-end items-end" : "self-start"}`}>
              <span className={`break-words rounded-2xl px-3 py-2 ${line.from === "user" ? "bg-lapis text-white" : "bg-white"}`}>{line.text}</span>
              {line.note && <span className="text-xs text-soft">{line.note}</span>}
            </li>
          ))}
        </ul>
        <form className="flex min-w-0 gap-2" onSubmit={send}>
          <label htmlFor={`${id}-msg`} className="sr-only">{t.placeholder}</label>
          <input id={`${id}-msg`} className={field} value={draft} maxLength={200} placeholder={t.placeholder} onChange={(e) => setDraft(e.target.value)} />
          <button type="submit" className="shrink-0 rounded-full bg-lapis px-4 py-2 text-sm font-semibold text-white">{t.send}</button>
        </form>
      </div>

      <details className="min-w-0">
        <summary className="cursor-pointer text-sm font-semibold text-lapis">{t.code}</summary>
        <pre tabIndex={0} className="mt-2 overflow-x-auto rounded-lg bg-ink p-3 font-mono text-xs leading-relaxed text-paper sm:text-sm">
          <code>{pythonCode(rules, fallback)}</code>
        </pre>
      </details>
    </DemoFrame>
  );
}
