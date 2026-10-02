"use client";

import { useState } from "react";
import { format, type Locale } from "@/lib/locale";
import { DemoFrame } from "./DemoFrame";
import { demoStrings } from "./strings";
import { lessonStrings } from "./strings-lessons";
import { ui } from "./ui";

export function EditorDemo({ locale }: { locale: Locale }) {
  const t = lessonStrings[locale].editor;
  const [choices, setChoices] = useState<(boolean | null)[]>(() => t.items.map(() => null));
  const answered = choices.filter((c) => c !== null).length;
  const right = choices.filter((c, i) => c !== null && c === t.items[i]!.approve).length;

  return (
    <DemoFrame label={demoStrings[locale].demo} title={t.title}>
      <p>{t.intro}</p>
      <ol className="flex flex-col gap-4">
        {t.items.map((item, i) => {
          const choice = choices[i];
          const decide = (approve: boolean) => setChoices((c) => c.map((v, j) => (j === i ? approve : v)));
          return (
            <li key={i} className={ui.card}>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg bg-paper p-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-soft">{t.source}</p>
                  <p>{item.source}</p>
                </div>
                <div className="rounded-lg border border-line p-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-lapis">{t.draft}</p>
                  <p>{item.draft}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" className={ui.button} disabled={choice !== null} aria-pressed={choice === true} onClick={() => decide(true)}>
                  ✓ {t.approve}
                </button>
                <button type="button" className={ui.button} disabled={choice !== null} aria-pressed={choice === false} onClick={() => decide(false)}>
                  ✗ {t.reject}
                </button>
              </div>
              <p aria-live="polite" className="text-sm">
                {choice !== null && (
                  <>
                    <strong>{choice === item.approve ? t.good : t.bad}</strong> {item.why}
                  </>
                )}
              </p>
            </li>
          );
        })}
      </ol>
      {answered === t.items.length && <p className="text-lg font-bold" aria-live="polite">{format(t.score, { n: right, total: t.items.length })}</p>}
    </DemoFrame>
  );
}
