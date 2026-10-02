/**
 * A small Markdown subset for blog articles: ## and ### headings, paragraphs, - and 1. lists, > quotes,
 * ``` code blocks, **bold**, *italic*, `code` and [links](https://…). It produces data, never HTML,
 * so article text cannot inject markup into the page.
 */

export type Inline =
  | { type: "text" | "strong" | "em" | "code"; text: string }
  | { type: "link"; text: string; href: string };

export interface QuizQuestion {
  question: string;
  options: { text: string; correct: boolean }[];
  explanation: string;
}

export type Block =
  | { type: "h2" | "h3" | "p" | "quote"; text: string }
  | { type: "ul" | "ol"; items: string[] }
  | { type: "code"; text: string; lang: string }
  | { type: "table"; head: string[]; rows: string[][] }
  | { type: "callout"; kind: "idea" | "warning"; text: string }
  | { type: "demo"; name: string }
  | { type: "quiz"; questions: QuizQuestion[] };

/**
 * A quiz block:
 *   ? Question
 *   - wrong answer
 *   + right answer
 *   ! explanation shown after answering
 * Questions are separated by a blank line.
 */
export function parseQuiz(text: string): QuizQuestion[] {
  return text
    .split(/\n\s*\n/)
    .map((chunk) => chunk.split("\n").map((l) => l.trim()).filter(Boolean))
    .filter((lines) => lines.length > 0)
    .map((lines) => {
      const question = lines.find((l) => l.startsWith("? "))?.slice(2) ?? "";
      const options = lines.filter((l) => /^[-+] /.test(l)).map((l) => ({ text: l.slice(2), correct: l.startsWith("+") }));
      const explanation = lines.find((l) => l.startsWith("! "))?.slice(2) ?? "";
      if (!question || options.length < 2 || options.filter((o) => o.correct).length !== 1) {
        throw new Error(`Invalid quiz question: ${lines.join(" | ")}`);
      }
      return { question, options, explanation };
    });
}

export function parseBlocks(source: string): Block[] {
  const blocks: Block[] = [];
  const text = source.replace(/\r\n/g, "\n");
  // Code fences first, so blank lines inside code do not split it.
  const parts = text.split(/^```([a-z]*)\n([\s\S]*?)^```$/m);
  // split() with two capture groups yields: text, lang, code, text, lang, code, …
  for (let index = 0; index < parts.length; index += 3) {
    const part = parts[index] ?? "";
    if (index > 0) {
      const lang = parts[index - 2] ?? "";
      const code = (parts[index - 1] ?? "").replace(/\n$/, "");
      blocks.push(lang === "quiz" ? { type: "quiz", questions: parseQuiz(code) } : { type: "code", text: code, lang });
    }
    for (const chunk of part.split(/\n{2,}/)) {
      const lines = chunk.split("\n").map((l) => l.trim()).filter(Boolean);
      if (lines.length === 0) continue;
      const first = lines[0]!;
      const demo = /^\{\{demo:([a-z-]+)\}\}$/.exec(first);
      if (demo && lines.length === 1) blocks.push({ type: "demo", name: demo[1]! });
      else if (first.startsWith("### ")) blocks.push({ type: "h3", text: first.slice(4) });
      else if (first.startsWith("## ")) blocks.push({ type: "h2", text: first.slice(3) });
      else if (lines.length >= 3 && lines.every((l) => l.startsWith("|")) && /^\|[\s:|-]+\|$/.test(lines[1]!)) {
        const cells = (l: string) => l.replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
        blocks.push({ type: "table", head: cells(first), rows: lines.slice(2).map(cells) });
      } else if (lines.every((l) => /^[-*] /.test(l))) blocks.push({ type: "ul", items: lines.map((l) => l.slice(2)) });
      else if (lines.every((l) => /^\d+\. /.test(l))) blocks.push({ type: "ol", items: lines.map((l) => l.replace(/^\d+\. /, "")) });
      else if (lines.every((l) => l.startsWith(">"))) {
        const text = lines.map((l) => l.replace(/^>\s?/, "")).join(" ");
        // GitHub-style callouts: "> [!IDEA] text" and "> [!WARNING] text".
        const callout = /^\[!(IDEA|WARNING)\]\s*(.*)$/.exec(text);
        if (callout) blocks.push({ type: "callout", kind: callout[1]!.toLowerCase() as "idea" | "warning", text: callout[2]! });
        else blocks.push({ type: "quote", text });
      }
      else blocks.push({ type: "p", text: lines.join(" ") });
    }
  }
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

/** Section headings for a table of contents; ids match the ones the article renders (s1, s2, …). */
export function outline(source: string): { id: string; text: string }[] {
  return parseBlocks(source)
    .filter((b): b is { type: "h2"; text: string } => b.type === "h2")
    .map((b, i) => ({ id: `s${i + 1}`, text: parseInline(b.text).map((part) => part.text).join("") }));
}
