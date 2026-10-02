"use client";

import dynamic from "next/dynamic";
import { useState, useSyncExternalStore, type ComponentType } from "react";
import { getLite, subscribeRoot } from "@/lib/preferences";
import type { Locale } from "@/lib/locale";
import { demoStrings } from "./strings";

// Each demo is its own chunk: a lesson downloads only the demos it shows, so adding lessons does not make every page heavier.
const demos: Record<string, ComponentType<{ locale: Locale }>> = {
  "bot-flow": dynamic(() => import("./BotFlowDemo").then((m) => m.BotFlowDemo)),
  "bot-playground": dynamic(() => import("./BotPlayground").then((m) => m.BotPlayground)),
  "amount": dynamic(() => import("./AmountDemo").then((m) => m.AmountDemo)),
  "editor": dynamic(() => import("./EditorDemo").then((m) => m.EditorDemo)),
  "letters": dynamic(() => import("./LettersDemo").then((m) => m.LettersDemo)),
  "chain": dynamic(() => import("./ChainDemo").then((m) => m.ChainDemo)),
  "nominal": dynamic(() => import("./NominalDemo").then((m) => m.NominalDemo)),
  "outage": dynamic(() => import("./OutageDemo").then((m) => m.OutageDemo)),
  "access": dynamic(() => import("./AccessDemo").then((m) => m.AccessDemo)),
  "signed-link": dynamic(() => import("./LinkDemo").then((m) => m.LinkDemo)),
  "slow-net": dynamic(() => import("./SlowNetDemo").then((m) => m.SlowNetDemo)),
};

export const demoNames = Object.keys(demos);

const noSubscribe = () => () => {};

/**
 * A demo's code is fetched only once it renders. The server and the first (hydration) render show an empty frame,
 * so nothing is fetched before the page knows whether the light version is on; in the light version the reader
 * taps "Load the exercise" first.
 */
export function Demo({ name, locale }: { name: string; locale: Locale }) {
  const hydrated = useSyncExternalStore(noSubscribe, () => true, () => false);
  const lite = useSyncExternalStore(subscribeRoot, getLite, () => null);
  const [requested, setRequested] = useState(false);
  const Component = demos[name];
  if (!Component) throw new Error(`Unknown demo "${name}"`);

  if (!hydrated) return <div aria-hidden="true" className="not-prose my-4 min-h-60 rounded-2xl border border-line bg-paper" />;
  if (lite && !requested) {
    return (
      <button
        type="button"
        onClick={() => setRequested(true)}
        className="not-prose my-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-line bg-paper px-8 py-7 font-sans text-lg font-bold text-link"
      >
        <span aria-hidden="true">▶</span>
        {demoStrings[locale].load}
      </button>
    );
  }
  return <Component locale={locale} />;
}
