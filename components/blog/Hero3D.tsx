"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";
import { getLite, subscribeRoot } from "@/lib/preferences";

/**
 * The 3D banner at the top of a lesson or article (front matter `hero`). Decorative: the server and the light
 * version show the dark banner without the scene, so nothing heavy loads before the page knows the reader's choice.
 */
const scenes: Record<string, React.ComponentType> = {
  globe: dynamic(() => import("./HeroScenes").then((m) => m.GlobeHero)),
  city: dynamic(() => import("./HeroScenes").then((m) => m.CityHero)),
};
export const heroNames = Object.keys(scenes);

const noSubscribe = () => () => {};

export function Hero3D({ name }: { name: string }) {
  const hydrated = useSyncExternalStore(noSubscribe, () => true, () => false);
  const lite = useSyncExternalStore(subscribeRoot, getLite, () => null);
  const Scene = scenes[name];
  if (!Scene) throw new Error(`Unknown hero "${name}"`);
  return (
    <div
      aria-hidden="true"
      data-hero={name}
      className="not-prose relative h-56 overflow-hidden rounded-3xl bg-[radial-gradient(ellipse_at_50%_35%,#18286b,#050a1f_70%)] sm:h-72"
    >
      <div className="absolute inset-0 bg-[radial-gradient(1px_1px_at_12%_22%,#fff9,transparent),radial-gradient(1px_1px_at_78%_14%,#fff7,transparent),radial-gradient(1.5px_1.5px_at_88%_64%,#fff8,transparent),radial-gradient(1px_1px_at_30%_78%,#fff6,transparent),radial-gradient(1px_1px_at_55%_40%,#fff5,transparent),radial-gradient(1px_1px_at_6%_60%,#fff6,transparent)]" />
      {hydrated && !lite && <Scene />}
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#050a1f]/70 to-transparent" />
    </div>
  );
}
