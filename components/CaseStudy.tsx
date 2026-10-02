import Image from "next/image";
import Link from "next/link";
import { simorghTags } from "@/content/site";
import { formatCount } from "@/lib/format";
import { format, getMessages, localePath, type Locale } from "@/lib/i18n";
import { getSnapshot } from "@/lib/stats";
import { ArchitectureDiagram } from "./ArchitectureDiagram";
import { PageShell } from "./PageShell";

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4 lg:gap-5">
      <h2 className="text-2xl font-extrabold tracking-[-0.02em] lg:text-[32px]">{title}</h2>
      {children}
    </section>
  );
}

const prose = "font-serif text-[17px] leading-[1.65] lg:text-lg";

export function CaseStudy({ locale }: { locale: Locale }) {
  const messages = getMessages(locale);
  const t = messages.case;
  const stats = getSnapshot();
  const home = localePath(locale);

  return (
    <PageShell locale={locale} path="/work/simorgh/">
      <div className="dark-surface bg-deep pb-14 pt-8 text-white lg:pb-20 lg:pt-14">
        <div className="container-page flex flex-col items-start gap-5 lg:gap-6">
          <Link href={`${home}#work`} className="text-[15px] font-medium text-mist hover:text-white">
            ← {t.back}
          </Link>
          <p className="rounded-full bg-white/8 px-2.5 py-[5px] text-[13px] font-semibold text-mist">{messages.work.caseLabel}</p>
          <h1 className="max-w-[900px] text-[clamp(30px,8vw,36px)] font-extrabold leading-[1.08] tracking-[-0.03em] [overflow-wrap:break-word] lg:text-[56px] lg:leading-[1.05]">
            {t.title}
          </h1>
          <p className="max-w-[720px] text-[17px] leading-normal text-mist lg:text-xl">{t.lead}</p>
          <ul aria-label={t.stackTitle} className="flex flex-wrap gap-2">
            {simorghTags.map((tag) => (
              <li key={tag} className="rounded-full border border-white/16 bg-white/8 px-2.5 py-[5px] text-[13px] font-medium">
                {tag}
              </li>
            ))}
          </ul>
          <Image
            src="/work/simorgh-panel.webp"
            alt={format(messages.work.screenshotAlt, { name: messages.work.simorgh.name })}
            width={2000}
            height={1125}
            priority
            sizes="(min-width: 1280px) 1216px, 100vw"
            className="mt-4 h-auto w-full rounded-[14px] shadow-[0_24px_48px_rgba(0,0,0,0.28)] lg:mt-6"
          />
        </div>
      </div>

      <div className="container-page flex max-w-[860px] flex-col gap-14 py-16 lg:gap-20 lg:py-24">
        <Block title={t.problemTitle}>
          <p className={prose}>{t.problem}</p>
        </Block>
        <Block title={t.approachTitle}>
          <ol className="flex flex-col gap-5">
            {t.steps.map((step, index) => (
              <li key={step.title} className="flex gap-4">
                <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-full bg-lapis text-[15px] font-bold text-white">
                  {index + 1}
                </span>
                <div className="pt-1">
                  <p className="text-lg font-semibold">{step.title}</p>
                  <p className={`mt-1 ${prose}`}>{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </Block>
        <Block title={t.diagramTitle}>
          <ArchitectureDiagram t={t} />
        </Block>
        <Block title={t.decisionsTitle}>
          <ul className="flex flex-col gap-3">
            {t.decisions.map((decision) => (
              <li key={decision} className={`flex items-start gap-3 ${prose}`}>
                <Image src="/icons/check-saffron.svg" alt="" width={20} height={20} className="mt-1.5 size-5 shrink-0" />
                {decision}
              </li>
            ))}
          </ul>
        </Block>
        <Block title={t.resultTitle}>
          <p className={prose}>
            {format(t.result, { articles: formatCount(stats.articles, locale), published: formatCount(stats.published, locale) })}
          </p>
        </Block>
        <Block title={t.learnedTitle}>
          <p className={prose}>{t.learned}</p>
        </Block>
      </div>

      <section aria-labelledby="case-cta" className="dark-surface bg-deep py-16 text-white lg:py-20">
        <div className="container-page flex flex-col items-start gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-[640px]">
            <h2 id="case-cta" className="text-[28px] font-extrabold tracking-[-0.02em] lg:text-4xl">
              {t.ctaTitle}
            </h2>
            <p className="mt-2 text-[17px] leading-normal text-mist">{t.ctaText}</p>
          </div>
          <Link href={`${home}#contact`} className="rounded-xl bg-saffron px-6 py-[15px] text-base font-semibold text-on-accent">
            {t.ctaButton}
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
