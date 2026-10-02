"use client";

import { useState } from "react";
import type { QuizQuestion } from "@/lib/markdown";
import { format, type Locale } from "@/lib/locale";
import { DemoFrame } from "./DemoFrame";
import { demoStrings } from "./strings";

export function Quiz({ locale, questions }: { locale: Locale; questions: QuizQuestion[] }) {
  const t = demoStrings[locale].quiz;
  const [answers, setAnswers] = useState<(number | null)[]>(() => questions.map(() => null));
  const done = answers.filter((a) => a !== null).length;
  const right = answers.filter((a, i) => a !== null && questions[i]!.options[a]!.correct).length;

  return (
    <DemoFrame label={demoStrings[locale].demo} title={t.title}>
      <ol className="flex flex-col gap-5">
        {questions.map((q, qi) => {
          const chosen = answers[qi];
          return (
            <li key={qi} className="flex flex-col gap-2 rounded-xl bg-white p-4">
              <p className="font-semibold">{qi + 1}. {q.question}</p>
              <div className="flex flex-col gap-2" role="group" aria-label={q.question}>
                {q.options.map((option, oi) => {
                  const state =
                    chosen === null ? "" : option.correct ? "border-turquoise bg-[#e3f4f1]" : chosen === oi ? "border-[#c2410c] bg-[#fdeee6]" : "opacity-60";
                  return (
                    <button
                      key={oi}
                      type="button"
                      disabled={chosen !== null}
                      aria-pressed={chosen === oi}
                      onClick={() => setAnswers((a) => a.map((v, i) => (i === qi ? oi : v)))}
                      className={`rounded-lg border border-line px-3 py-2 text-left hover:border-lapis disabled:cursor-default ${state}`}
                    >
                      {option.text}
                    </button>
                  );
                })}
              </div>
              <p aria-live="polite" className="text-sm">
                {chosen !== null && (
                  <>
                    <strong>{q.options[chosen]!.correct ? `✓ ${t.correct}` : `✗ ${t.wrong}`}</strong> {q.explanation}
                  </>
                )}
              </p>
            </li>
          );
        })}
      </ol>
      {done === questions.length && <p className="text-lg font-bold" aria-live="polite">{format(t.score, { n: right, total: questions.length })}</p>}
    </DemoFrame>
  );
}
