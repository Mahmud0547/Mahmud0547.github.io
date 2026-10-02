import { describe, expect, it } from "vitest";
import { allArticles, parseArticle } from "@/lib/blog";
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
