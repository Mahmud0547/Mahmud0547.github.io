"use client";

import Image from "next/image";
import { useSyncExternalStore } from "react";
import { getThemeChoice, nextTheme, setThemeChoice, subscribeRoot, themeChoices, type ThemeChoice } from "@/lib/preferences";

export type ThemeLabels = { label: string } & Record<ThemeChoice, string>;

const icon = (choice: ThemeChoice, active: boolean) => `/icons/theme-${choice}${active ? "-active" : ""}.svg`;

/** The visitor's choice. The server does not know it, so it renders "same as the device" and React updates after hydration. */
function useThemeChoice(): ThemeChoice {
  return useSyncExternalStore(subscribeRoot, getThemeChoice, () => "system");
}

/** Desktop: three buttons — Light, Same as the device, Dark. */
export function ThemeSwitcher({ labels, className = "" }: { labels: ThemeLabels; className?: string }) {
  const choice = useThemeChoice();
  return (
    <div role="group" aria-label={labels.label} className={`gap-1 rounded-[10px] bg-white/8 p-1 ${className}`}>
      {themeChoices.map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={choice === option}
          title={labels[option]}
          onClick={() => setThemeChoice(option)}
          className="grid place-items-center rounded-[7px] px-2.5 py-[7px] hover:bg-white/10 aria-pressed:bg-white/16"
        >
          <Image src={icon(option, choice === option)} alt="" width={16} height={16} />
          <span className="sr-only">{labels[option]}</span>
        </button>
      ))}
    </div>
  );
}

/** Phones: one round button that cycles Light → Same as the device → Dark. */
export function ThemeCycleButton({ labels, className = "" }: { labels: ThemeLabels; className?: string }) {
  const choice = useThemeChoice();
  return (
    <button
      type="button"
      onClick={() => setThemeChoice(nextTheme(choice))}
      aria-label={`${labels.label}: ${labels[choice]}`}
      title={labels[choice]}
      className={`grid size-10 place-items-center rounded-full bg-white/8 hover:bg-white/14 ${className}`}
    >
      <Image src={icon(choice, true)} alt="" width={16} height={16} />
    </button>
  );
}
