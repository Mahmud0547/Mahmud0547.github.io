import type { Metadata, MetadataRoute } from "next";
import { links } from "@/content/site";
import { allArticles } from "./blog";
import { config } from "./config";
import { getMessages } from "./i18n";
import { htmlLang, localePath, locales, type Locale } from "./locale";

/** Every page of the site, without the locale prefix. */
export const sitePaths = ["/", "/work/simorgh/", "/privacy/", "/blog/"] as const;

const ogLocale: Record<Locale, string> = { en: "en_US", ru: "ru_RU", tj: "tg_TJ" };
const ogImage = { url: `${config.siteUrl}/og.png`, width: 1200, height: 630 };

const absolute = (locale: Locale, path: string) => `${config.siteUrl}${localePath(locale, path)}`;

function languageLinks(path: string): Record<string, string> {
  return Object.fromEntries(locales.map((locale) => [htmlLang[locale], absolute(locale, path)]));
}

export function pageMetadata({ locale, path, title, description }: { locale: Locale; path: string; title: string; description: string }): Metadata {
  const url = absolute(locale, path);
  return {
    metadataBase: new URL(config.siteUrl),
    title,
    description,
    alternates: { canonical: url, languages: { ...languageLinks(path), "x-default": absolute("en", path) } },
    openGraph: { title, description, url, siteName: "SimorghDev", locale: ogLocale[locale], type: "website", images: [ogImage] },
    twitter: { card: "summary_large_image", title, description, images: [ogImage.url] },
    verification: { google: config.googleVerification },
  };
}

export function sitemapEntries(): MetadataRoute.Sitemap {
  const pages = sitePaths.flatMap((path) =>
    locales.map((locale) => ({ url: absolute(locale, path), alternates: { languages: languageLinks(path) } })),
  );
  // Articles are in English; only the English URL is listed (the others point to it as canonical).
  const articles = allArticles().map((a) => ({ url: absolute("en", `/blog/${a.slug}/`), lastModified: a.date }));
  return [...pages, ...articles];
}

/** Metadata for an article: one canonical English URL for every language version of the page. */
export function articleMetadata(article: { slug: string; title: string; description: string; date: string }): Metadata {
  const url = absolute("en", `/blog/${article.slug}/`);
  return {
    metadataBase: new URL(config.siteUrl),
    title: `${article.title} | SimorghDev`,
    description: article.description,
    alternates: { canonical: url },
    openGraph: { title: article.title, description: article.description, url, siteName: "SimorghDev", type: "article", publishedTime: article.date, images: [ogImage] },
    twitter: { card: "summary_large_image", title: article.title, description: article.description, images: [ogImage.url] },
    verification: { google: config.googleVerification },
  };
}

/** Structured data for search engines: who runs the site and what the service is. */
export function personJsonLd(locale: Locale): Record<string, unknown> {
  const t = getMessages(locale);
  const home = absolute(locale, "/");
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${config.siteUrl}/#person`,
        name: "Mahmud Faiezov",
        jobTitle: "Telegram bot and AI automation developer",
        url: home,
        image: `${config.siteUrl}/images/mahmud.webp`,
        address: { "@type": "PostalAddress", addressLocality: "Dushanbe", addressCountry: "TJ" },
        sameAs: [links.github, links.linkedin, links.instagram, links.fiverr, links.upwork, links.telegram, links.channel],
      },
      {
        "@type": "ProfessionalService",
        name: "SimorghDev",
        url: home,
        description: t.meta.description,
        areaServed: "Worldwide",
        priceRange: "$50–$320",
        founder: { "@id": `${config.siteUrl}/#person` },
      },
    ],
  };
}
