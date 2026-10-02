import { formatCount, formatDate, shortSource } from "@/lib/format";
import type { Messages } from "@/lib/i18n";
import { format, type Locale } from "@/lib/locale";
import type { Stats } from "@/lib/stats";

type PipelineProps = {
  locale: Locale;
  t: Messages["pipeline"];
  stats: Stats;
  /** True only after the production API answered. */
  live?: boolean;
  /** Highlighted step for the animation; null means static. */
  activeStep?: number | null;
};

export function Pipeline({ locale, t, stats, live = false, activeStep = null }: PipelineProps) {
  const count = (value: number) => formatCount(value, locale);
  const steps = [
    { ...t.collect, metric: format(t.collect.metric, { count: count(stats.articles) }), tone: "text-dim" },
    { ...t.write, metric: null, tone: "" },
    { ...t.review, metric: format(t.review.metric, { count: count(stats.reviewed) }), tone: "text-dim" },
    { ...t.publish, metric: format(t.publish.metric, { count: count(stats.published) }), tone: "text-mint" },
  ];

  return (
    <section
      aria-labelledby="pipeline-title"
      className="flex flex-col gap-4 rounded-[20px] border border-white/8 bg-panel p-[18px] lg:gap-5 lg:rounded-3xl lg:px-7 lg:pb-6 lg:pt-[26px]"
    >
      <div className="flex items-center justify-between gap-4">
        <h2 id="pipeline-title" className="text-sm font-semibold text-white lg:text-base">
          {t.title}
        </h2>
        {live ? (
          <p className="flex shrink-0 items-center gap-1.5 text-xs font-semibold text-mint lg:text-[13px]">
            <span aria-hidden="true" className="size-2 rounded-full bg-mint" />
            {t.live}
          </p>
        ) : (
          <p className="shrink-0 text-xs text-dim lg:text-[13px]">{format(t.updated, { date: formatDate(stats.updated_at, locale) })}</p>
        )}
      </div>
      <ol data-active-step={activeStep ?? undefined}>
        {steps.map((step, index) => {
          const last = index === steps.length - 1;
          const active = activeStep === index;
          return (
            <li key={step.title} className="flex gap-3 lg:gap-4">
              <div aria-hidden="true" className="flex flex-col items-center">
                <span
                  className={`grid size-8 place-items-center rounded-full text-sm font-bold transition-colors duration-500 lg:size-9 lg:text-[15px] ${
                    active ? "bg-saffron text-on-accent" : "bg-white/10 text-white"
                  }`}
                >
                  {index + 1}
                </span>
                {!last && (
                  <span className="relative h-6 w-0.5 bg-white/14 [--packet-distance:20px] lg:h-10 lg:[--packet-distance:36px]">
                    {active && <span data-packet className="pipeline-packet absolute -left-[3px] top-0 size-2 rounded-full bg-saffron" />}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1 pt-1 lg:pt-1.5">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="font-semibold text-white lg:text-lg">{step.title}</p>
                  {step.metric && <p className={`shrink-0 text-[13px] font-semibold lg:text-sm ${step.tone}`}>{step.metric}</p>}
                </div>
                <p className="mt-0.5 text-[13px] leading-[1.4] text-dim lg:mt-1 lg:text-sm">{step.text}</p>
              </div>
            </li>
          );
        })}
      </ol>
      {stats.latest && (
        <div className="flex flex-col gap-[3px] rounded-xl bg-white/4 px-3.5 py-3 lg:rounded-[14px] lg:px-4 lg:py-3.5">
          <p className="text-xs font-semibold text-saffron">{format(t.latest, { source: shortSource(stats.latest.source) })}</p>
          <p className="text-sm font-medium leading-[1.35] text-white lg:text-[15px]">{stats.latest.title}</p>
        </div>
      )}
      <p className="text-xs text-dim lg:text-[13px]">{t.caption}</p>
    </section>
  );
}
