import type { ComponentType } from "react";
import type { Locale } from "@/lib/locale";
import { parseBlocks, parseInline } from "@/lib/markdown";
import { AmountDemo } from "./blog/AmountDemo";
import { BotFlowDemo } from "./blog/BotFlowDemo";
import { BotPlayground } from "./blog/BotPlayground";
import { Quiz } from "./blog/Quiz";

/** Interactive blocks an article can place with {{demo:name}} on its own line. */
const demos: Record<string, ComponentType<{ locale: Locale }>> = {
  "bot-flow": BotFlowDemo,
  "bot-playground": BotPlayground,
  "amount": AmountDemo,
};

const external = { target: "_blank", rel: "noopener noreferrer" } as const;

function Inline({ text }: { text: string }) {
  return (
    <>
      {parseInline(text).map((part, i) => {
        if (part.type === "strong") return <strong key={i}>{part.text}</strong>;
        if (part.type === "em") return <em key={i}>{part.text}</em>;
        if (part.type === "code") return <code key={i} className="rounded bg-paper px-1.5 py-0.5 font-mono text-[0.9em]">{part.text}</code>;
        if (part.type === "link") {
          return (
            <a key={i} href={part.href} className="font-semibold text-lapis underline" {...(/^https?:/i.test(part.href) ? external : {})}>
              {part.text}
            </a>
          );
        }
        return <span key={i}>{part.text}</span>;
      })}
    </>
  );
}

/** Renders article text. React escapes every string, so the output can contain only these elements. */
export function Markdown({ source, locale = "en" }: { source: string; locale?: Locale }) {
  return (
    <div className="flex flex-col gap-5 font-serif text-[17px] leading-[1.7] lg:text-lg">
      {parseBlocks(source).map((block, i) => {
        switch (block.type) {
          case "h2":
            return <h2 key={i} className="mt-6 font-sans text-2xl font-extrabold tracking-[-0.02em] lg:text-[28px]"><Inline text={block.text} /></h2>;
          case "h3":
            return <h3 key={i} className="mt-4 font-sans text-xl font-bold"><Inline text={block.text} /></h3>;
          case "quote":
            return <blockquote key={i} className="border-l-4 border-saffron pl-4 text-soft"><Inline text={block.text} /></blockquote>;
          case "ul":
            return <ul key={i} className="flex list-disc flex-col gap-2 pl-6">{block.items.map((item, j) => <li key={j}><Inline text={item} /></li>)}</ul>;
          case "ol":
            return <ol key={i} className="flex list-decimal flex-col gap-2 pl-6">{block.items.map((item, j) => <li key={j}><Inline text={item} /></li>)}</ol>;
          case "table":
            return (
              <div key={i} tabIndex={0} role="region" aria-label={block.head.join(", ")} className="overflow-x-auto rounded-xl border border-line">
                <table className="w-full border-collapse font-sans text-base">
                  <thead className="bg-paper">
                    <tr>{block.head.map((cell, j) => <th key={j} scope="col" className="px-4 py-3 text-left font-bold"><Inline text={cell} /></th>)}</tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, r) => (
                      <tr key={r} className="border-t border-line">
                        {row.map((cell, j) => j === 0
                          ? <th key={j} scope="row" className="px-4 py-3 text-left font-semibold"><Inline text={cell} /></th>
                          : <td key={j} className="px-4 py-3"><Inline text={cell} /></td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          case "demo": {
            const Demo = demos[block.name];
            if (!Demo) throw new Error(`Unknown demo "${block.name}"`);
            return <Demo key={i} locale={locale} />;
          }
          case "quiz":
            return <Quiz key={i} locale={locale} questions={block.questions} />;
          case "code":
            return <pre key={i} tabIndex={0} className="overflow-x-auto rounded-xl bg-ink p-4 font-mono text-sm leading-relaxed text-paper"><code>{block.text}</code></pre>;
          default:
            return <p key={i}><Inline text={block.text} /></p>;
        }
      })}
    </div>
  );
}
