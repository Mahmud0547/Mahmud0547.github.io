/**
 * A small Markdown subset for blog articles: ## and ### headings, paragraphs, - and 1. lists, > quotes,
 * ``` code blocks, **bold**, *italic*, `code` and [links](https://…). It produces data, never HTML,
 * so article text cannot inject markup into the page.
 */

export type Inline =
  | { type: "text" | "strong" | "em" | "code"; text: string }
  | { type: "link"; text: string; href: string };

export type Block =
  | { type: "h2" | "h3" | "p" | "quote"; text: string }
  | { type: "ul" | "ol"; items: string[] }
  | { type: "code"; text: string };

export function parseBlocks(source: string): Block[] {
  const blocks: Block[] = [];
  const text = source.replace(/\r\n/g, "\n");
  // Code fences first, so blank lines inside code do not split it.
  const parts = text.split(/^```[a-z]*\n([\s\S]*?)^```$/m);
  parts.forEach((part, index) => {
    if (index % 2 === 1) {
      blocks.push({ type: "code", text: part.replace(/\n$/, "") });
      return;
    }
    for (const chunk of part.split(/\n{2,}/)) {
      const lines = chunk.split("\n").map((l) => l.trim()).filter(Boolean);
      if (lines.length === 0) continue;
      const first = lines[0]!;
      if (first.startsWith("### ")) blocks.push({ type: "h3", text: first.slice(4) });
      else if (first.startsWith("## ")) blocks.push({ type: "h2", text: first.slice(3) });
      else if (lines.every((l) => /^[-*] /.test(l))) blocks.push({ type: "ul", items: lines.map((l) => l.slice(2)) });
      else if (lines.every((l) => /^\d+\. /.test(l))) blocks.push({ type: "ol", items: lines.map((l) => l.replace(/^\d+\. /, "")) });
      else if (lines.every((l) => l.startsWith(">"))) blocks.push({ type: "quote", text: lines.map((l) => l.replace(/^>\s?/, "")).join(" ") });
      else blocks.push({ type: "p", text: lines.join(" ") });
    }
  });
  return blocks;
}

const SAFE_HREF = /^(https?:\/\/|mailto:|\/(?!\/))/i;

export function parseInline(text: string): Inline[] {
  const out: Inline[] = [];
  const pattern = /`([^`]+)`|\*\*([^*]+)\*\*|\*([^*]+)\*|\[([^\]]+)\]\(((?:[^()\s]|\([^()\s]*\))+)\)/g;
  let last = 0;
  for (const match of text.matchAll(pattern)) {
    const index = match.index ?? 0;
    if (index > last) out.push({ type: "text", text: text.slice(last, index) });
    if (match[1] !== undefined) out.push({ type: "code", text: match[1] });
    else if (match[2] !== undefined) out.push({ type: "strong", text: match[2] });
    else if (match[3] !== undefined) out.push({ type: "em", text: match[3] });
    else if (match[4] !== undefined) {
      const href = match[5] ?? "";
      out.push(SAFE_HREF.test(href) ? { type: "link", text: match[4], href } : { type: "text", text: match[4] });
    }
    last = index + match[0].length;
  }
  if (last < text.length) out.push({ type: "text", text: text.slice(last) });
  return out;
}
