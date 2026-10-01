import en from "@/messages/en.json";
import ru from "@/messages/ru.json";
import tj from "@/messages/tj.json";

export const locales = ["en", "ru", "tj"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export type Messages = typeof en;

const dictionaries: Record<Locale, Messages> = { en, ru, tj };

/** Language tag for `lang` and `hreflang`. The URL uses `tj`, the language code is `tg`. */
export const htmlLang: Record<Locale, string> = { en: "en", ru: "ru", tj: "tg" };

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function getMessages(locale: Locale): Messages {
  return dictionaries[locale];
}

export function localePath(locale: Locale, path = "/"): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return locale === defaultLocale ? clean : `/${locale}${clean}`;
}

export function format(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in vars ? String(vars[key]) : match));
}
