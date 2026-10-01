import { Fragment } from "react";
import type { Messages } from "@/lib/i18n";

type Node = { key: keyof Messages["case"]["diagram"]; tone: string };

const nodes: Node[] = [
  { key: "feeds", tone: "border-line bg-paper text-ink" },
  { key: "collector", tone: "border-line bg-paper text-ink" },
  { key: "database", tone: "border-line bg-paper text-ink" },
  { key: "llm", tone: "border-lapis bg-lapis text-white" },
  { key: "review", tone: "border-line bg-paper text-ink" },
  { key: "channel", tone: "border-saffron bg-saffron text-ink" },
];

/** The Simorgh data flow as a row of labelled steps; announced to screen readers as one image. */
export function ArchitectureDiagram({ t }: { t: Messages["case"] }) {
  return (
    <div role="img" aria-label={t.diagramLabel} className="rounded-[20px] border border-line bg-white p-5 lg:p-6">
      <div className="flex flex-col items-stretch gap-2 lg:flex-row lg:items-stretch lg:gap-2">
        {nodes.map((node, index) => (
          <Fragment key={node.key}>
            <span
              className={`flex items-center justify-center rounded-xl border px-3 py-3 text-center text-[15px] font-semibold leading-tight lg:flex-auto lg:px-2.5 lg:text-[13px] ${node.tone}`}
            >
              {t.diagram[node.key]}
            </span>
            {index < nodes.length - 1 && (
              <span className="self-center text-lg leading-none text-soft">
                <span className="lg:hidden">↓</span>
                <span className="hidden lg:inline">→</span>
              </span>
            )}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
