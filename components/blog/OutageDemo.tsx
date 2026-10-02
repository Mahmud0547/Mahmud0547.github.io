"use client";

import { useState } from "react";
import type { Locale } from "@/lib/locale";
import { DemoFrame } from "./DemoFrame";
import { demoStrings } from "./strings";
import { lessonStrings } from "./strings-lessons";

export function OutageDemo({ locale }: { locale: Locale }) {
  const t = lessonStrings[locale].outage;
  const [down, setDown] = useState(false);

  return (
    <DemoFrame label={demoStrings[locale].demo} title={t.title}>
      <label className="flex items-center gap-3 self-start rounded-full bg-surface px-4 py-2 font-semibold">
        <input type="checkbox" className="h-5 w-5 accent-danger-line" checked={down} onChange={(e) => setDown(e.target.checked)} />
        🏦 {t.toggle}
      </label>
      <div className="grid gap-3 sm:grid-cols-2" aria-live="polite">
        <div className="flex flex-col gap-2 rounded-xl bg-surface p-4">
          <p className="text-sm font-bold">A · {t.naive}</p>
          {down ? <p className="font-semibold text-danger">✗ {t.naiveDown}</p> : <p className="font-mono text-lg font-bold">{t.naiveOk}</p>}
        </div>
        <div className="flex flex-col gap-2 rounded-xl bg-surface p-4">
          <p className="text-sm font-bold">B · {t.cached}</p>
          <p className="font-mono text-lg font-bold">{t.cachedValue}</p>
          <p className="text-sm text-soft">{down ? t.cachedDownNote : t.cachedNote}</p>
        </div>
      </div>
    </DemoFrame>
  );
}
