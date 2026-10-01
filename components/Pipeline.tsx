import { formatCount, formatDate } from "@/lib/format";
import { format, getMessages, type Locale } from "@/lib/i18n";
import type { Stats } from "@/lib/stats";

export function Pipeline({ locale, stats }: { locale: Locale; stats: Stats }) {
  const t = getMessages(locale).pipeline;
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
        <p className="shrink-0 text-xs text-dim lg:text-[13px]">{format(t.updated, { date: formatDate(stats.updated_at, locale) })}</p>
      </div>
      <ol>
        {steps.map((step, index) => {
          const last = index === steps.length - 1;
          return (
            <li key={step.title} className="flex gap-3 lg:gap-4">
              <div aria-hidden="true" className="flex flex-col items-center">
                <span className="grid size-8 place-items-center rounded-full bg-white/10 text-sm font-bold text-white lg:size-9 lg:text-[15px]">
                  {index + 1}
                </span>
                {!last && <span className="h-6 w-0.5 bg-white/14 lg:h-10" />}
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
        <div className="flex flex-col gap-[3px] rounded-xl bg-white/6 px-3.5 py-3 lg:rounded-[14px] lg:px-4 lg:py-3.5">
          <p className="text-xs font-semibold text-saffron">{format(t.latest, { source: stats.latest.source })}</p>
          <p className="text-sm font-medium leading-[1.35] text-white lg:text-[15px]">{stats.latest.title}</p>
        </div>
      )}
      <p className="text-xs text-dim lg:text-[13px]">{t.caption}</p>
    </section>
  );
}
