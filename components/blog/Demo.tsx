"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { Locale } from "@/lib/locale";

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
};

export const demoNames = Object.keys(demos);

export function Demo({ name, locale }: { name: string; locale: Locale }) {
  const Component = demos[name];
  if (!Component) throw new Error(`Unknown demo "${name}"`);
  return <Component locale={locale} />;
}
