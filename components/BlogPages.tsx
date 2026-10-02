import Link from "next/link";
import type { Article } from "@/lib/blog";
import { formatDate } from "@/lib/format";
import { format, getMessages, localePath, type Locale } from "@/lib/i18n";
import { JsonLd } from "./JsonLd";
import { Markdown } from "./Markdown";
import { PageShell } from "./PageShell";
import { config } from "@/lib/config";
import { htmlLang } from "@/lib/locale";

export function BlogIndex({ locale, articles }: { locale: Locale; articles: Article[] }) {
  const t = getMessages(locale).blog;
  return (
    <PageShell locale={locale} path="/blog/">
      <div className="container-page flex max-w-[860px] flex-col gap-10 py-16 lg:py-24">
        <div className="flex flex-col gap-3">
          <h1 className="text-[clamp(32px,9vw,40px)] font-extrabold tracking-[-0.03em] lg:text-5xl">{t.title}</h1>
          <p className="text-lg text-soft">{t.lead}</p>
          {articles.some((a) => a.lang !== locale) && <p className="text-sm text-soft">{t.englishNote}</p>}
        </div>
        <ul className="flex flex-col divide-y divide-line">
          {articles.map((a) => (
            <li key={a.slug} className="flex flex-col gap-2 py-7">
              <p className="text-sm text-soft">
                <time dateTime={a.date}>{formatDate(a.date, locale)}</time> · {format(t.minutes, { count: a.minutes })}
              </p>
              <h2 className="text-2xl font-extrabold tracking-[-0.02em]" lang={htmlLang[a.lang]}>
                <Link href={localePath(locale, `/blog/${a.slug}/`)} className="hover:text-lapis">{a.title}</Link>
              </h2>
              <p className="font-serif text-[17px] leading-relaxed text-soft" lang={htmlLang[a.lang]}>{a.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </PageShell>
  );
}

export function BlogArticle({ locale, article }: { locale: Locale; article: Article }) {
  const t = getMessages(locale).blog;
  const url = `${config.siteUrl}${localePath(article.lang, `/blog/${article.slug}/`)}`;
  return (
    <PageShell locale={locale} path={`/blog/${article.slug}/`}>
      <article className="container-page flex max-w-[760px] flex-col gap-6 py-16 lg:py-24" lang={htmlLang[article.lang]}>
        <Link href={localePath(locale, "/blog/")} className="font-semibold text-lapis" lang={htmlLang[locale]}>← {t.back}</Link>
        <p className="text-sm text-soft">
          <time dateTime={article.date}>{formatDate(article.date, locale)}</time> · {format(t.minutes, { count: article.minutes })}
          {article.tags.length > 0 && ` · ${article.tags.join(", ")}`}
        </p>
        <h1 className="text-[clamp(30px,8vw,36px)] font-extrabold leading-[1.1] tracking-[-0.03em] lg:text-5xl">{article.title}</h1>
        <p className="text-xl leading-relaxed text-soft">{article.description}</p>
        <Markdown source={article.body} locale={article.lang} />
      </article>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: article.title,
          description: article.description,
          datePublished: article.date,
          inLanguage: htmlLang[article.lang],
          url,
          mainEntityOfPage: url,
          author: { "@type": "Person", name: "Mahmud Faiezov", url: config.siteUrl },
          publisher: { "@type": "Organization", name: "SimorghDev", url: config.siteUrl },
        }}
      />
    </PageShell>
  );
}
