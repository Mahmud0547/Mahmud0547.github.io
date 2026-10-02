"use client";

import { useId, useState } from "react";
import { cyrillicCheck } from "@/lib/demos";
import type { Locale } from "@/lib/locale";
import { DemoFrame } from "./DemoFrame";
import { demoStrings } from "./strings";
import { lessonStrings } from "./strings-lessons";
import { ui } from "./ui";

export function LettersDemo({ locale }: { locale: Locale }) {
  const t = lessonStrings[locale].letters;
  const id = useId();
  const [text, setText] = useState(t.exampleTexts[1]!);
  const check = cyrillicCheck(text);
  const percent = Math.round(check.share * 100);

  return (
    <DemoFrame label={demoStrings[locale].demo} title={t.title}>
      <p>{t.intro}</p>
      <div className="flex flex-wrap items-center gap-2">
        <span className={ui.label}>{t.examples}:</span>
        {t.exampleNames.map((name, i) => (
          <button key={name} type="button" className={ui.button} aria-pressed={text === t.exampleTexts[i]} onClick={() => setText(t.exampleTexts[i]!)}>
            {name}
          </button>
        ))}
      </div>
      <label htmlFor={`${id}-text`} className={ui.label}>{t.label}</label>
      <textarea id={`${id}-text`} className={`${ui.field} min-h-24`} value={text} maxLength={400} onChange={(e) => setText(e.target.value)} />
      <dl className="grid grid-cols-3 gap-2 text-center">
        {[
          [t.letters, String(check.letters)],
          [t.russian, String(check.cyrillic)],
          [t.share, `${percent}%`],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg bg-surface p-2">
            <dt className="text-xs text-soft">{label}</dt>
            <dd className="font-mono text-lg font-bold">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="h-3 overflow-hidden rounded-full bg-line" aria-hidden="true">
        <div className={`h-full ${check.pass ? "bg-turquoise" : "bg-danger-line"}`} style={{ width: `${percent}%` }} />
      </div>
      <p aria-live="polite" className={`rounded-lg px-3 py-2 font-semibold ${check.pass ? "bg-success-soft text-success" : "bg-danger-soft text-danger"}`}>
        {check.pass ? `✓ ${t.pass}` : `✗ ${t.fail}`}
      </p>
    </DemoFrame>
  );
}
