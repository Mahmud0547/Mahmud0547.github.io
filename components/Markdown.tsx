import type { Locale } from "@/lib/locale";
import { parseBlocks, parseInline } from "@/lib/markdown";
import { Demo } from "./blog/Demo";
import { Quiz } from "./blog/Quiz";

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
            <a key={i} href={part.href} className="font-semibold text-link underline" {...(/^https?:/i.test(part.href) ? external : {})}>
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
type Labels = { idea: string; warning: string };

const calloutStyle = {
  idea: { icon: "💡", box: "border-saffron bg-idea-soft" },
  warning: { icon: "⚠️", box: "border-danger-line bg-danger-soft" },
};

export function Markdown({ source, locale = "en", labels }: { source: string; locale?: Locale; labels?: Labels }) {
  const blocks = parseBlocks(source);
  // Section ids s1, s2, … in heading order, the same ones outline() gives the table of contents.
  const sectionIds = new Map(blocks.flatMap((b, i) => (b.type === "h2" ? [i] : [])).map((blockIndex, n) => [blockIndex, `s${n + 1}`]));
  return (
    <div className="flex flex-col gap-5 font-serif text-[17px] leading-[1.7] lg:text-lg">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "h2":
            return <h2 key={i} id={sectionIds.get(i)} className="mt-6 scroll-mt-24 font-sans text-2xl font-extrabold tracking-[-0.02em] lg:text-[28px]"><Inline text={block.text} /></h2>;
          case "h3":
            return <h3 key={i} className="mt-4 font-sans text-xl font-bold"><Inline text={block.text} /></h3>;
          case "quote":
            return <blockquote key={i} className="border-l-4 border-saffron pl-4 text-soft"><Inline text={block.text} /></blockquote>;
          case "ul":
            return <ul key={i} className="flex list-disc flex-col gap-2 pl-6">{block.items.map((item, j) => <li key={j}><Inline text={item} /></li>)}</ul>;
          case "ol":
            return <ol key={i} className="flex list-decimal flex-col gap-2 pl-6">{block.items.map((item, j) => <li key={j}><Inline text={item} /></li>)}</ol>;
          case "callout": {
            const style = calloutStyle[block.kind];
            return (
              <aside key={i} className={`flex gap-3 rounded-xl border-l-4 px-4 py-3 font-sans text-base leading-relaxed ${style.box}`}>
                <span aria-hidden="true" className="text-xl">{style.icon}</span>
                <p>
                  {labels && <strong className="block">{labels[block.kind]}</strong>}
                  <Inline text={block.text} />
                </p>
              </aside>
            );
          }
          case "table":
            return (
              <div key={i} tabIndex={0} role="region" aria-label={block.head.join(", ")} className="overflow-x-auto rounded-xl border border-line">
                <table className="w-full border-collapse font-sans text-base">
                  <thead className="bg-paper">
                    <tr>{block.head.map((cell, j) => cell.trim() === "" ? <td key={j} /> /* empty corner cell: not a header */ : <th key={j} scope="col" className="px-4 py-3 text-left font-bold"><Inline text={cell} /></th>)}</tr>
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
          case "demo":
            // Interactive blocks an article places with {{demo:name}} on its own line.
            return <Demo key={i} name={block.name} locale={locale} />;
          case "quiz":
            return <Quiz key={i} locale={locale} questions={block.questions} />;
          case "code":
            return <pre key={i} tabIndex={0} className="overflow-x-auto rounded-xl bg-night p-4 font-mono text-sm leading-relaxed text-on-night"><code>{block.text}</code></pre>;
          default:
            return <p key={i}><Inline text={block.text} /></p>;
        }
      })}
    </div>
  );
}
