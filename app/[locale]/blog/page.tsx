import type { Metadata } from "next";
import { BlogIndex } from "@/components/BlogPages";
import { allArticles } from "@/lib/blog";
import { getMessages, isLocale, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = getMessages(locale as Locale).blog;
  return pageMetadata({ locale: locale as Locale, path: "/blog/", title: `${t.title} | SimorghDev`, description: t.lead });
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;
  return <BlogIndex locale={locale} articles={allArticles(locale)} />;
}
