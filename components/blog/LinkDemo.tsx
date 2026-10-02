"use client";

import { useEffect, useState } from "react";
import { format, type Locale } from "@/lib/locale";
import { DemoFrame } from "./DemoFrame";
import { demoStrings } from "./strings";
import { lessonStrings } from "./strings-lessons";
import { ui } from "./ui";

const LIFETIME = 60;

export function LinkDemo({ locale }: { locale: Locale }) {
  const t = lessonStrings[locale].link;
  const [left, setLeft] = useState<number | null>(null);
  const [opened, setOpened] = useState<boolean | null>(null);
  const ticking = left !== null && left > 0;

  useEffect(() => {
    if (!ticking) return;
    const id = window.setInterval(() => setLeft((s) => (s === null ? s : Math.max(0, s - 1))), 1000);
    return () => window.clearInterval(id);
  }, [ticking]);

  return (
    <DemoFrame label={demoStrings[locale].demo} title={t.title}>
      <p>{t.intro}</p>
      <button type="button" className={`${ui.primary} self-start`} onClick={() => { setLeft(LIFETIME); setOpened(null); }}>
        🔗 {t.get}
      </button>
      {left !== null && (
        <div className={ui.card}>
          <code className="break-all rounded bg-paper px-2 py-1 font-mono text-sm">…/storage/v1/object/sign/documents/report.pdf?token=eyJh…</code>
          <p className={`font-semibold ${left > 0 ? "text-[#0d5e5c]" : "text-[#9a3412]"}`}>
            ⏱ {left > 0 ? format(t.left, { s: left }) : t.expired}
          </p>
          <div className="flex flex-wrap gap-2">
            <button type="button" className={ui.button} onClick={() => setOpened(left > 0)}>{t.open}</button>
            <button type="button" className={ui.button} disabled={left === 0} onClick={() => setLeft((s) => Math.max(0, (s ?? 0) - 30))}>⏩ {t.skip}</button>
          </div>
        </div>
      )}
      <p aria-live="polite" className="font-semibold">{opened === null ? "" : opened ? t.ok : t.denied}</p>
    </DemoFrame>
  );
}
