import Link from "next/link";
import type { Article } from "@/lib/blog";
import { config } from "@/lib/config";
import { formatDate } from "@/lib/format";
import { format, getMessages, localePath, type Locale, type Messages } from "@/lib/i18n";
import { htmlLang } from "@/lib/locale";
import { outline } from "@/lib/markdown";
import { articleImage } from "@/lib/seo";
import { CourseProgress, type LessonLink } from "./blog/CourseProgress";
import { LessonDone } from "./blog/LessonDone";
import { ReadingProgress } from "./blog/ReadingProgress";
import { JsonLd } from "./JsonLd";
import { Markdown } from "./Markdown";
import { PageShell } from "./PageShell";

type BlogText = Messages["blog"];

const languageNames: Record<Locale, string> = { en: "English", ru: "Русский", tj: "Тоҷикӣ" };

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Link to an article. Slugs come from file names; anything but [a-z0-9-] is refused at build time. */
function articlePath(locale: Locale, slug: string): string {
  if (!SLUG.test(slug)) throw new Error(`Unsafe article slug: ${slug}`);
  return localePath(locale, `/blog/${slug}/`);
}

function lessonLinks(locale: Locale, lessons: Article[], t: BlogText): LessonLink[] {
  return lessons.map((a) => ({
    slug: a.slug,
    href: articlePath(locale, a.slug),
    title: a.title,
    minutes: format(t.minutes, { count: a.minutes }),
    lang: htmlLang[a.lang],
  }));
}

function seriesName(t: BlogText, id: string): string {
  return (t.series as Record<string, string>)[id] ?? id;
}

export function BlogIndex({ locale, articles }: { locale: Locale; articles: Article[] }) {
  const t = getMessages(locale).blog;
  const seriesIds = [...new Set(articles.flatMap((a) => (a.series ? [a.series.id] : [])))];
  const others = articles.filter((a) => !a.series);
  return (
    <PageShell locale={locale} path="/blog/">
      <div className="container-page flex max-w-[860px] flex-col gap-12 py-16 lg:py-24">
        <div className="flex flex-col gap-3">
          <h1 className="text-[clamp(32px,9vw,40px)] font-extrabold tracking-[-0.03em] lg:text-5xl">{t.title}</h1>
          <p className="text-lg text-soft">{t.lead}</p>
          {articles.some((a) => a.lang !== locale) && <p className="text-sm text-soft">{t.englishNote}</p>}
        </div>

        {seriesIds.map((id) => {
          const lessons = articles.filter((a) => a.series?.id === id).sort((a, b) => a.series!.lesson - b.series!.lesson);
          return (
            <section key={id} aria-labelledby={`course-${id}`} className="flex flex-col gap-5 rounded-3xl border border-line bg-surface p-5 shadow-sm sm:p-8">
              <div className="flex flex-col gap-2">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-link">{t.course}</p>
                <h2 id={`course-${id}`} className="text-2xl font-extrabold tracking-[-0.02em] lg:text-3xl">{seriesName(t, id)}</h2>
                <p className="text-soft">{t.courseLead}</p>
              </div>
              <CourseProgress lessons={lessonLinks(locale, lessons, t)} t={t} />
            </section>
          );
        })}

        {others.length > 0 && (
          <section aria-labelledby="articles" className="flex flex-col gap-5 rounded-3xl border border-line bg-surface p-5 shadow-sm sm:p-8">
            <div className="flex flex-col gap-2">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-link">{t.articles}</p>
              <h2 id="articles" className="text-2xl font-extrabold tracking-[-0.02em] lg:text-3xl">{t.articlesTitle}</h2>
              <p className="text-soft">{t.articlesLead}</p>
            </div>
            <ul className="flex flex-col gap-3">
              {others.map((a) => (
                <li key={a.slug}>
                  <Link
                    href={articlePath(locale, a.slug)}
                    className="group flex flex-col gap-2.5 rounded-2xl border border-line bg-paper p-5 hover:border-link sm:p-6"
                  >
                    <span className="text-sm text-soft">
                      <span className="font-semibold text-link">{t.caseStudy}</span> · <time dateTime={a.date}>{formatDate(a.date, locale)}</time> ·{" "}
                      {format(t.minutes, { count: a.minutes })}
                    </span>
                    <span className="text-xl font-extrabold tracking-[-0.02em] group-hover:text-link" lang={htmlLang[a.lang]}>
                      {a.title}
                    </span>
                    <span className="font-serif text-[17px] leading-relaxed text-soft" lang={htmlLang[a.lang]}>
                      {a.description}
                    </span>
                    {a.result && (
                      <span className="self-start rounded-xl bg-success-soft px-3 py-1.5 text-sm font-bold text-success" lang={htmlLang[a.lang]}>
                        {a.result}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </PageShell>
  );
}

function Contents({ items, title }: { items: { id: string; text: string }[]; title: string }) {
  return (
    <ol className="flex flex-col gap-1 text-[15px]">
      {items.map((item) => (
        <li key={item.id}>
          <a href={`#${item.id}`} className="block rounded-lg px-2 py-1.5 text-soft hover:bg-paper hover:text-ink" aria-label={`${title}: ${item.text}`}>
            {item.text}
          </a>
        </li>
      ))}
    </ol>
  );
}

export function BlogArticle({ locale, article, lessons = [] }: { locale: Locale; article: Article; lessons?: Article[] }) {
  const t = getMessages(locale).blog;
  const url = `${config.siteUrl}${articlePath(article.lang, article.slug)}`;
  const lang = htmlLang[article.lang];
  const sections = outline(article.body);
  const index = lessons.findIndex((l) => l.slug === article.slug);
  const next = index >= 0 ? lessons[index + 1] : undefined;
  const course = article.series && lessons.length > 0 ? lessonLinks(locale, lessons, t) : null;

  return (
    <PageShell locale={locale} path={articlePath("en", article.slug)}>
      <ReadingProgress target="article" />
      <div className="container-page flex max-w-[1160px] flex-col gap-6 py-12 lg:py-20">
        <Link href={localePath(locale, "/blog/")} className="self-start font-semibold text-link">← {t.back}</Link>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,760px)_280px] lg:justify-between">
          <article id="article" className="flex min-w-0 flex-col gap-6" lang={lang}>
            <header className="flex flex-col gap-4">
              <p className="flex flex-wrap items-center gap-x-3 gap-y-2 font-sans text-sm text-soft" lang={htmlLang[locale]}>
                {!article.series && <span className="font-semibold text-link">{t.caseStudy}</span>}
                {article.series && (
                  <span className="font-semibold text-link">
                    {seriesName(t, article.series.id)} · {format(t.lesson, { n: article.series.lesson, total: Math.max(lessons.length, article.series.lesson) })}
                  </span>
                )}
                {article.level && <span className="rounded-full bg-success-soft px-3 py-0.5 font-semibold text-success">{t.levels[article.level]}</span>}
                <span>
                  <time dateTime={article.date}>{formatDate(article.date, locale)}</time> · {format(t.minutes, { count: article.minutes })}
                </span>
              </p>
              <h1 className="text-[clamp(30px,8vw,36px)] font-extrabold leading-[1.1] tracking-[-0.03em] lg:text-5xl">{article.title}</h1>
              <p className="text-xl leading-relaxed text-soft">{article.description}</p>
              {article.languages.length > 1 && (
                <nav aria-label={t.readIn} className="flex flex-wrap items-center gap-2 font-sans text-sm" lang={htmlLang[locale]}>
                  <span className="text-soft">{t.readIn}:</span>
                  {article.languages.map((l) =>
                    l === article.lang ? (
                      <span key={l} aria-current="page" className="rounded-full bg-night px-3 py-1 font-semibold text-white" lang={htmlLang[l]}>{languageNames[l]}</span>
                    ) : (
                      <Link key={l} href={articlePath(l, article.slug)} hrefLang={htmlLang[l]} lang={htmlLang[l]} className="rounded-full border border-line px-3 py-1 hover:border-link">
                        {languageNames[l]}
                      </Link>
                    ),
                  )}
                </nav>
              )}
            </header>

            {article.learn.length > 0 && (
              <section aria-labelledby="learn" className="rounded-2xl border border-line bg-surface p-5 font-sans sm:p-6">
                <h2 id="learn" className="mb-3 text-lg font-bold">🎯 {t.learnTitle}</h2>
                <ul className="flex flex-col gap-2">
                  {article.learn.map((point) => (
                    <li key={point} className="flex gap-2"><span aria-hidden="true" className="text-turquoise">✓</span>{point}</li>
                  ))}
                </ul>
              </section>
            )}

            {sections.length > 2 && (
              <details className="rounded-2xl border border-line p-4 font-sans lg:hidden">
                <summary className="cursor-pointer font-bold">{t.toc}</summary>
                <nav aria-label={t.toc} className="mt-3"><Contents items={sections} title={t.toc} /></nav>
              </details>
            )}

            <Markdown source={article.body} locale={article.lang} labels={t.callouts} />

            {article.series && (
              <footer className="mt-6 flex flex-col gap-6 border-t border-line pt-8" lang={htmlLang[locale]}>
                <LessonDone slug={article.slug} t={t} />
                {next && (
                  <Link href={articlePath(locale, next.slug)} className="group flex flex-col gap-1 rounded-2xl bg-deep p-5 text-white sm:p-6">
                    <span className="text-sm font-semibold text-saffron">{t.next} →</span>
                    <span className="text-xl font-extrabold group-hover:underline" lang={htmlLang[next.lang]}>{next.title}</span>
                  </Link>
                )}
              </footer>
            )}

            {!article.series && (
              <footer className="dark-surface mt-6 flex flex-col gap-4 rounded-3xl bg-deep p-6 font-sans text-white sm:p-8" lang={htmlLang[locale]}>
                <h2 className="text-2xl font-extrabold tracking-[-0.02em] lg:text-3xl">{t.cta.title}</h2>
                <p className="text-lg text-mist">{t.cta.text}</p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link href={`${localePath(locale)}#contact`} className="rounded-xl bg-saffron px-6 py-3.5 text-center font-semibold text-on-accent">
                    {t.cta.contact}
                  </Link>
                  <Link href={`${localePath(locale)}#services`} className="rounded-xl border-[1.5px] border-white/35 px-6 py-3.5 text-center font-semibold text-white">
                    {t.cta.services}
                  </Link>
                </div>
              </footer>
            )}
          </article>

          <aside className="flex flex-col gap-8 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:self-start lg:overflow-y-auto" lang={htmlLang[locale]}>
            {sections.length > 2 && (
              <nav aria-label={t.toc} className="hidden flex-col gap-2 font-sans lg:flex">
                <p className="px-2 text-xs font-bold uppercase tracking-[0.14em] text-soft">{t.toc}</p>
                <Contents items={sections} title={t.toc} />
              </nav>
            )}
            {course && (
              <section aria-label={t.allLessons} className="flex flex-col gap-3">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-soft">{t.allLessons}</p>
                <CourseProgress lessons={course} current={article.slug} t={t} />
              </section>
            )}
          </aside>
        </div>
      </div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: article.title,
          description: article.description,
          datePublished: article.date,
          inLanguage: lang,
          image: articleImage(article).url,
          url,
          mainEntityOfPage: url,
          author: { "@type": "Person", name: "Mahmud Faiezov", url: config.siteUrl },
          publisher: { "@type": "Organization", name: "SimorghDev", url: config.siteUrl },
        }}
      />
    </PageShell>
  );
}
