import { describe, expect, it } from "vitest";
import { allArticles, articleBySlug, parseArticle } from "@/lib/blog";
import type { Locale } from "@/lib/locale";
import { parseBlocks, parseInline } from "@/lib/markdown";

describe("parseArticle", () => {
  it("reads front matter and estimates reading time", () => {
    const a = parseArticle("x", "---\ntitle: T\ndescription: D\ndate: 2026-10-02\ntags: AI, Bots\n---\n\nHello world");
    expect(a).toMatchObject({ slug: "x", title: "T", description: "D", date: "2026-10-02", tags: ["AI", "Bots"], body: "Hello world", minutes: 1 });
  });

  it("strips quotes around values", () => {
    expect(parseArticle("x", '---\ntitle: "A: B"\ndescription: D\ndate: 2026-10-02\n---\nx').title).toBe("A: B");
  });

  it.each([
    ["no front matter", "Hello"],
    ["missing title", "---\ndescription: D\ndate: 2026-10-02\n---\nx"],
    ["bad date", "---\ntitle: T\ndescription: D\ndate: yesterday\n---\nx"],
  ])("rejects %s", (_n, source) => {
    expect(() => parseArticle("x", source)).toThrow();
  });
});

describe("articles in content/blog", () => {
  const articles = allArticles();
  it("exist, have unique slugs and are newest first", () => {
    expect(articles.length).toBeGreaterThanOrEqual(3);
    expect(new Set(articles.map((a) => a.slug)).size).toBe(articles.length);
    expect(articles.map((a) => a.date)).toEqual([...articles.map((a) => a.date)].sort().reverse());
  });
  it("use URL-safe slugs and descriptions short enough for search results", () => {
    for (const a of articles) {
      expect(a.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(a.description.length, a.slug).toBeLessThanOrEqual(170);
    }
  });
});

describe("markdown", () => {
  it("keeps code blocks whole, including blank lines", () => {
    const blocks = parseBlocks("Intro\n\n```sql\nselect 1;\n\nselect 2;\n```\n\n## Next");
    expect(blocks.map((b) => b.type)).toEqual(["p", "code", "h2"]);
    expect(blocks[1]).toMatchObject({ text: "select 1;\n\nselect 2;" });
  });
  it("reads inline code, bold, italic and safe links only", () => {
    expect(parseInline("use `rls` **now** *please* [x](https://a.b) [y](javascript:alert(1))")).toEqual([
      { type: "text", text: "use " },
      { type: "code", text: "rls" },
      { type: "text", text: " " },
      { type: "strong", text: "now" },
      { type: "text", text: " " },
      { type: "em", text: "please" },
      { type: "text", text: " " },
      { type: "link", text: "x", href: "https://a.b" },
      { type: "text", text: " " },
      { type: "text", text: "y" },
    ]);
  });
});

describe("interactive blocks", () => {
  it("reads a demo placeholder on its own line", () => {
    expect(parseBlocks("Text\n\n{{demo:bot-flow}}\n\nMore")).toEqual([
      { type: "p", text: "Text" },
      { type: "demo", name: "bot-flow" },
      { type: "p", text: "More" },
    ]);
  });

  it("keeps the language of a code fence", () => {
    expect(parseBlocks("```python\nprint(1)\n```")).toEqual([{ type: "code", text: "print(1)", lang: "python" }]);
  });

  it("reads a quiz with one right answer per question", () => {
    const [block] = parseBlocks("```quiz\n? Q1\n- a\n+ b\n! because\n\n? Q2\n+ x\n- y\n```");
    expect(block).toEqual({
      type: "quiz",
      questions: [
        { question: "Q1", options: [{ text: "a", correct: false }, { text: "b", correct: true }], explanation: "because" },
        { question: "Q2", options: [{ text: "x", correct: true }, { text: "y", correct: false }], explanation: "" },
      ],
    });
  });

  it("rejects a quiz question without exactly one right answer", () => {
    expect(() => parseBlocks("```quiz\n? Q\n- a\n- b\n```")).toThrow(/Invalid quiz/);
    expect(() => parseBlocks("```quiz\n? Q\n+ a\n+ b\n```")).toThrow(/Invalid quiz/);
  });

  it("reads a table", () => {
    expect(parseBlocks("| | A | B |\n|---|---|---|\n| x | 1 | 2 |")).toEqual([{ type: "table", head: ["", "A", "B"], rows: [["x", "1", "2"]] }]);
  });
});

describe("translations", () => {
  it("serves a translation where one exists and English otherwise", () => {
    const tj = allArticles("tj");
    const bot = tj.find((a) => a.slug === "how-a-telegram-bot-works")!;
    expect(bot.lang).toBe("tj");
    expect(bot.languages).toEqual(["en", "ru", "tj"]);
    expect(tj.find((a) => a.slug === "official-data-you-can-trust")!.lang).toBe("en");
  });

  it("has the same interactive blocks in every language of an article", () => {
    for (const article of allArticles()) {
      const shape = (lang: Locale) =>
        parseBlocks(articleBySlug(article.slug, lang)!.body)
          .filter((b) => b.type === "demo" || b.type === "quiz")
          .map((b) => (b.type === "demo" ? b.name : `quiz:${b.questions.length}`));
      for (const lang of article.languages) expect(shape(lang)).toEqual(shape("en"));
    }
  });
});
