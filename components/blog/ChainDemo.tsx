"use client";

import { useId, useState } from "react";
import { runChain, type ModelState } from "@/lib/demos";
import type { Locale } from "@/lib/locale";
import { DemoFrame } from "./DemoFrame";
import { demoStrings } from "./strings";
import { lessonStrings } from "./strings-lessons";
import { ui } from "./ui";

const states: ModelState[] = ["ok", "busy", "english"];

export function ChainDemo({ locale }: { locale: Locale }) {
  const t = lessonStrings[locale].chain;
  const id = useId();
  const [models, setModels] = useState<ModelState[]>(["busy", "english", "ok"]);
  const [result, setResult] = useState<ReturnType<typeof runChain> | null>(null);

  return (
    <DemoFrame label={demoStrings[locale].demo} title={t.title}>
      <p>{t.intro}</p>
      <ol className="grid gap-2 sm:grid-cols-3">
        {t.models.map((name, i) => (
          <li key={name} className={ui.card}>
            <label htmlFor={`${id}-${i}`} className="font-semibold">{i + 1}. {name}</label>
            <select
              id={`${id}-${i}`}
              className={ui.field}
              value={models[i]}
              onChange={(e) => {
                setModels((m) => m.map((v, j) => (j === i ? (e.target.value as ModelState) : v)));
                setResult(null);
              }}
            >
              {states.map((s) => <option key={s} value={s}>{t.states[s]}</option>)}
            </select>
          </li>
        ))}
      </ol>
      <button type="button" className={`${ui.primary} self-start`} onClick={() => setResult(runChain(t.models.map((name, i) => ({ name, state: models[i]! }))))}>
        ▶ {t.run}
      </button>
      <div aria-live="polite">
        {result && (
          <ol className="flex flex-col gap-1 rounded-xl bg-night p-4 font-mono text-sm text-on-night">
            {result.steps.map((step) => <li key={step.model}>{step.model}: {t.log[step.state]}</li>)}
            {!result.writer && <li className="text-saffron">{t.none}</li>}
          </ol>
        )}
      </div>
    </DemoFrame>
  );
}
