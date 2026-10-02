import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogArticle } from "@/components/BlogPages";
import { allArticles, articleBySlug } from "@/lib/blog";
import { defaultLocale, isLocale, locales } from "@/lib/i18n";
import { articleMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: string; slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.filter((l) => l !== defaultLocale).flatMap((locale) => allArticles().map((a) => ({ locale, slug: a.slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = articleBySlug((await params).slug);
  return article ? articleMetadata(article) : {};
}

export default async function Page({ params }: Props) {
  const { locale, slug } = await params;
  const article = articleBySlug(slug);
  if (!isLocale(locale) || !article) notFound();
  return <BlogArticle locale={locale} article={article} />;
}
