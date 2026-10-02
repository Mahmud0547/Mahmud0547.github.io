import type { ReactNode } from "react";

/** The card every interactive demo sits in, so readers can tell "try it" blocks from the text around them. */
export function DemoFrame({ label, title, children }: { label: string; title: string; children: ReactNode }) {
  return (
    <section aria-label={title} className="not-prose my-4 flex min-w-0 flex-col gap-4 rounded-2xl border border-line bg-paper p-4 font-sans text-base leading-normal sm:p-6">
      <div className="flex flex-col gap-1">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-lapis">{label}</p>
        <h3 className="text-xl font-extrabold tracking-[-0.01em]">{title}</h3>
      </div>
      {children}
    </section>
  );
}
