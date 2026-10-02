"use client";

import Image from "next/image";
import { useState, useSyncExternalStore } from "react";
import { getLite, setLite, subscribeRoot } from "@/lib/preferences";

export type LiteLabels = { title: string; text: string; showFull: string; close: string; toggle: string };

/** null on the server and during hydration; the real state right after. */
export function useLite() {
  return useSyncExternalStore(subscribeRoot, getLite, () => null);
}

/** Shown when the light version switched on by itself because the connection is slow. */
export function LiteBanner({ labels }: { labels: LiteLabels }) {
  const lite = useLite();
  const [closed, setClosed] = useState(false);
  if (lite !== "auto" || closed) return null;
  return (
    <div role="status" className="border-b border-saffron bg-banner">
      <div className="container-page flex flex-wrap items-center gap-x-4 gap-y-2 py-3.5">
        <Image src="/icons/slow-connection.svg" alt="" width={22} height={22} className="shrink-0 dark:hidden" />
        <Image src="/icons/slow-connection-dark.svg" alt="" width={22} height={22} className="hidden shrink-0 dark:block" />
        <div className="min-w-0 flex-1 basis-60">
          <p className="font-bold">{labels.title}</p>
          <p className="text-sm text-soft">{labels.text}</p>
        </div>
        <button type="button" onClick={() => setLite(false)} className="text-[15px] font-bold text-link">
          {labels.showFull}
        </button>
        <button type="button" onClick={() => setClosed(true)} aria-label={labels.close} className="grid size-8 place-items-center text-soft">
          <span aria-hidden="true">✕</span>
        </button>
      </div>
    </div>
  );
}

/** Footer switch: anyone can turn the light version on or off by hand. */
export function LiteToggle({ label }: { label: string }) {
  const lite = useLite();
  return (
    <button type="button" aria-pressed={lite !== null} onClick={() => setLite(lite === null)} className="hover:text-white">
      {label}
      <span aria-hidden="true">{lite !== null ? " ✓" : ""}</span>
    </button>
  );
}
