import { getMessages, type Locale } from "@/lib/i18n";
import { Section } from "./Section";

export function Process({ locale }: { locale: Locale }) {
  const t = getMessages(locale).process;
  return (
    <Section id="process" title={t.title} lead={t.lead} dark>
      <ol className="flex flex-col lg:flex-row lg:gap-6">
        {t.steps.map((step, index) => {
          const first = index === 0;
          const last = index === t.steps.length - 1;
          return (
            <li key={step.title} className="flex gap-3.5 lg:flex-1 lg:flex-col lg:gap-4">
              <div aria-hidden="true" className="flex flex-col items-center lg:flex-row lg:gap-3">
                <span
                  className={`grid size-8 shrink-0 place-items-center rounded-full text-sm font-bold lg:size-10 lg:text-base ${
                    first ? "bg-saffron text-on-accent" : "bg-white/10 text-white"
                  }`}
                >
                  {index + 1}
                </span>
                {!last && <span className="w-0.5 flex-1 bg-white/14 lg:h-0.5 lg:w-auto lg:bg-white/18" />}
              </div>
              <div className={`flex flex-col gap-1.5 pt-1 lg:gap-4 lg:pt-0 ${last ? "" : "pb-6 lg:pb-0"}`}>
                <h3 className="text-lg font-bold text-white lg:text-[22px]">{step.title}</h3>
                <p className="text-[15px] leading-[1.55] text-mist lg:text-base">{step.text}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </Section>
  );
}
