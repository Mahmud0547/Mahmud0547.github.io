import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { locales, type Locale } from "./locale";

/**
 * Blog articles live in content/blog as Markdown with a small front matter block:
 *   <slug>.md     — English (required)
 *   <slug>.ru.md  — Russian translation (optional)
 *   <slug>.tj.md  — Tajik translation (optional)
 * Read at build time; a page in a language without a translation shows the English text.
 */

export interface Article {
  slug: string;
  /** Language of this text. */
  lang: Locale;
  /** Languages this article exists in. */
  languages: Locale[];
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  tags: string[];
  body: string;
  minutes: number;
  /** Course this article is a lesson of, and its place in it (front matter `series` and `lesson`). */
  series?: { id: string; lesson: number };
  level?: "beginner" | "intermediate";
  /** "In this lesson you will learn" points (front matter `learn`, separated by ";"). */
  learn: string[];
  /** For articles (not lessons): the one measured result shown on the article's card (front matter `result`). */
  result?: string;
  /** A 3D banner above the title (front matter `hero`: globe or city). */
  hero?: string;
}

const DIR = join(process.cwd(), "content", "blog");

export function parseArticle(slug: string, source: string, lang: Locale = "en", languages: Locale[] = [lang]): Article {
  const match = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(source.replace(/\r\n/g, "\n"));
  if (!match) throw new Error(`${slug} (${lang}) has no front matter`);
  const meta = Object.fromEntries(
    match[1]!.split("\n").map((line) => {
      const i = line.indexOf(":");
      return [line.slice(0, i).trim(), line.slice(i + 1).trim().replace(/^"(.*)"$/, "$1")];
    }),
  );
  for (const key of ["title", "description", "date"]) {
    if (!meta[key]) throw new Error(`${slug} (${lang}) is missing "${key}"`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(meta.date)) throw new Error(`${slug} (${lang}) has an invalid date`);
  if (meta.series && !(Number(meta.lesson) >= 1)) throw new Error(`${slug} (${lang}) is in a series but has no lesson number`);
  if (meta.level && meta.level !== "beginner" && meta.level !== "intermediate") throw new Error(`${slug} (${lang}) has an unknown level`);
  const body = match[2]!.trim();
  const words = body.replace(/```[\s\S]*?```/g, "").split(/\s+/).length;
  return {
    slug,
    lang,
    languages,
    title: meta.title,
    description: meta.description,
    date: meta.date,
    tags: (meta.tags ?? "").split(",").map((t: string) => t.trim()).filter(Boolean),
    body,
    minutes: Math.max(1, Math.round(words / 200)),
    ...(meta.series ? { series: { id: meta.series, lesson: Number(meta.lesson) } } : {}),
    ...(meta.level ? { level: meta.level as Article["level"] } : {}),
    learn: (meta.learn ?? "").split(";").map((t: string) => t.trim()).filter(Boolean),
    ...(meta.result ? { result: meta.result } : {}),
    ...(meta.hero ? { hero: meta.hero } : {}),
  };
}

function slugs(): Map<string, Locale[]> {
  const found = new Map<string, Locale[]>();
  for (const file of readdirSync(DIR).filter((f) => f.endsWith(".md"))) {
    const m = /^([a-z0-9-]+?)(?:\.(ru|tj))?\.md$/.exec(file);
    if (!m) throw new Error(`Unexpected file name in content/blog: ${file}`);
    const lang = (m[2] ?? "en") as Locale;
    found.set(m[1]!, [...(found.get(m[1]!) ?? []), lang]);
  }
  for (const [slug, langs] of found) {
    if (!langs.includes("en")) throw new Error(`${slug} has translations but no English file`);
    found.set(slug, locales.filter((l) => langs.includes(l)));
  }
  return found;
}

function read(slug: string, lang: Locale, languages: Locale[]): Article {
  const file = lang === "en" ? `${slug}.md` : `${slug}.${lang}.md`;
  return parseArticle(slug, readFileSync(join(DIR, file), "utf8"), lang, languages);
}

/** Every article in `locale` where a translation exists, otherwise in English; newest first, translated ones first on the same day. */
export function allArticles(locale: Locale = "en"): Article[] {
  return [...slugs()]
    .map(([slug, languages]) => read(slug, languages.includes(locale) ? locale : "en", languages))
    .sort((a, b) => b.date.localeCompare(a.date) || b.languages.length - a.languages.length);
}

export function articleBySlug(slug: string, locale: Locale = "en"): Article | undefined {
  const languages = slugs().get(slug);
  if (!languages) return undefined;
  return read(slug, languages.includes(locale) ? locale : "en", languages);
}

/** Lessons of a course in order, each in `locale` where translated. */
export function seriesLessons(id: string, locale: Locale = "en"): Article[] {
  return allArticles(locale)
    .filter((a) => a.series?.id === id)
    .sort((a, b) => a.series!.lesson - b.series!.lesson);
}
