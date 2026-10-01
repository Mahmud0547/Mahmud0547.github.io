import { Onest, Source_Serif_4 } from "next/font/google";

export const onest = Onest({
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  variable: "--font-onest",
  display: "swap",
});

export const sourceSerif = Source_Serif_4({
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  variable: "--font-source-serif",
  display: "swap",
  // Only used below the first screen: do not compete with Onest for the hero headline.
  preload: false,
});
