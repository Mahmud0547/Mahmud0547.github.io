import { privacyUpdated } from "@/content/site";
import { formatDate } from "@/lib/format";
import { format, getMessages, type Locale } from "@/lib/i18n";
import { PageShell } from "./PageShell";

export function PrivacyPage({ locale }: { locale: Locale }) {
  const t = getMessages(locale).privacy;
  return (
    <PageShell locale={locale} path="/privacy/">
      <div className="container-page flex max-w-[860px] flex-col gap-10 py-16 lg:gap-14 lg:py-24">
        <div className="flex flex-col gap-3">
          <h1 className="text-[clamp(32px,9vw,40px)] font-extrabold tracking-[-0.03em] lg:text-5xl">{t.title}</h1>
          <p className="text-soft">{format(t.updated, { date: formatDate(privacyUpdated, locale) })}</p>
        </div>
        {t.sections.map((section) => (
          <section key={section.title} className="flex flex-col gap-3">
            <h2 className="text-2xl font-extrabold tracking-[-0.02em]">{section.title}</h2>
            <p className="font-serif text-[17px] leading-[1.65] lg:text-lg">{section.text}</p>
          </section>
        ))}
      </div>
    </PageShell>
  );
}
