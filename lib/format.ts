import { htmlLang, type Locale } from "./locale";

export function formatCount(value: number, locale: Locale): string {
  return new Intl.NumberFormat(htmlLang[locale]).format(value);
}

export function formatDate(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(htmlLang[locale], { dateStyle: "long", timeZone: "Asia/Dushanbe" }).format(new Date(iso));
}

export function formatPrice(usd: number, locale: Locale): string {
  return new Intl.NumberFormat(htmlLang[locale], { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(usd);
}

/** Feed titles like "Al Jazeera – Breaking News…" become "Al Jazeera". */
export function shortSource(source: string): string {
  return source.split(/\s[–—-]\s/)[0].trim();
}
