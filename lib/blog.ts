import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

/** Blog articles live in content/blog/<slug>.md with a small front matter block. Read at build time. */

export interface Article {
  slug: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  tags: string[];
  body: string;
  minutes: number;
}

const DIR = join(process.cwd(), "content", "blog");

export function parseArticle(slug: string, source: string): Article {
  const match = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(source.replace(/\r\n/g, "\n"));
  if (!match) throw new Error(`${slug}.md has no front matter`);
  const meta = Object.fromEntries(
    match[1]!.split("\n").map((line) => {
      const i = line.indexOf(":");
      return [line.slice(0, i).trim(), line.slice(i + 1).trim().replace(/^"(.*)"$/, "$1")];
    }),
  );
  for (const key of ["title", "description", "date"]) {
    if (!meta[key]) throw new Error(`${slug}.md is missing "${key}"`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(meta.date)) throw new Error(`${slug}.md has an invalid date`);
  const body = match[2]!.trim();
  const words = body.split(/\s+/).length;
  return {
    slug,
    title: meta.title,
    description: meta.description,
    date: meta.date,
    tags: (meta.tags ?? "").split(",").map((t: string) => t.trim()).filter(Boolean),
    body,
    minutes: Math.max(1, Math.round(words / 220)),
  };
}

export function allArticles(): Article[] {
  return readdirSync(DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => parseArticle(f.replace(/\.md$/, ""), readFileSync(join(DIR, f), "utf8")))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function articleBySlug(slug: string): Article | undefined {
  return allArticles().find((a) => a.slug === slug);
}
