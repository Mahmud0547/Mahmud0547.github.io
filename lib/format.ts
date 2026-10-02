import { htmlLang, type Locale } from "./locale";

/**
 * Browsers ship no Tajik ("tg") formatting data, while Node does: the same Intl call gives "1,558" in the browser
 * and "1 558" on the server, and React reports a hydration mismatch. Tajik written in Cyrillic groups digits and
 * writes decimals like Russian, so numbers use Russian rules and dates are built here, identically everywhere.
 */
function numberTag(locale: Locale): string {
  return locale === "tj" ? "ru-RU" : htmlLang[locale];
}

const tajikMonths = ["январи", "феврали", "марти", "апрели", "майи", "июни", "июли", "августи", "сентябри", "октябри", "ноябри", "декабри"];

export function formatNumber(value: number, locale: Locale, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat(numberTag(locale), options).format(value);
}

export function formatCount(value: number, locale: Locale): string {
  return formatNumber(value, locale);
}

export function formatDate(iso: string, locale: Locale): string {
  const date = new Date(iso);
  if (locale === "tj") {
    const parts = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Dushanbe", year: "numeric", month: "numeric", day: "numeric" }).formatToParts(date);
    const part = (type: string) => Number(parts.find((p) => p.type === type)?.value);
    return `${part("day")} ${tajikMonths[part("month") - 1]} ${part("year")}`;
  }
  return new Intl.DateTimeFormat(htmlLang[locale], { dateStyle: "long", timeZone: "Asia/Dushanbe" }).format(date);
}

export function formatPrice(usd: number, locale: Locale): string {
  return formatNumber(usd, locale, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

/** Feed titles like "Al Jazeera – Breaking News…" become "Al Jazeera". */
export function shortSource(source: string): string {
  return source.split(/\s[–—-]\s/)[0].trim();
}
