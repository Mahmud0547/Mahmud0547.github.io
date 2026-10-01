import en from "@/messages/en.json";
import ru from "@/messages/ru.json";
import tj from "@/messages/tj.json";
import type { Locale } from "./locale";

export { defaultLocale, format, htmlLang, isLocale, localePath, locales, type Locale } from "./locale";

export type Messages = typeof en;

const dictionaries: Record<Locale, Messages> = { en, ru, tj };

export function getMessages(locale: Locale): Messages {
  return dictionaries[locale];
}
