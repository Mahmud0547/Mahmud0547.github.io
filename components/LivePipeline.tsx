"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import type { Messages } from "@/lib/i18n";
import type { Locale } from "@/lib/locale";
import { fetchLiveStats } from "@/lib/live-stats";
import { getLite, subscribeRoot } from "@/lib/preferences";
import type { Stats } from "@/lib/stats";
import { Pipeline } from "./Pipeline";

const STEP_MS = 1400;
const motionQuery = "(prefers-reduced-motion: no-preference)";

function subscribeMotion(onChange: () => void) {
  const query = window.matchMedia(motionQuery);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

type LivePipelineProps = { locale: Locale; t: Messages["pipeline"]; snapshot: Stats };

export function LivePipeline({ locale, t, snapshot }: LivePipelineProps) {
  const [live, setLive] = useState<Stats | null>(null);
  const [step, setStep] = useState(0);
  const animate = useSyncExternalStore(
    subscribeMotion,
    () => window.matchMedia(motionQuery).matches,
    () => false,
  );

  // The light version keeps the live numbers (a tiny request) but not the motion.
  const lite = useSyncExternalStore(subscribeRoot, getLite, () => null);
  const moving = animate && lite === null;

  useEffect(() => {
    const controller = new AbortController();
    void fetchLiveStats(controller.signal).then((fresh) => {
      if (fresh) setLive(fresh);
    });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!moving) return;
    const id = window.setInterval(() => setStep((current) => (current + 1) % 4), STEP_MS);
    return () => window.clearInterval(id);
  }, [moving]);

  return <Pipeline locale={locale} t={t} stats={live ?? snapshot} live={live !== null} activeStep={moving ? step : null} />;
}
