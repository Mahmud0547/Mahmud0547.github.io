import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogArticle } from "@/components/BlogPages";
import { allArticles, articleBySlug, seriesLessons } from "@/lib/blog";
import { articleMetadata } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return allArticles().map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = articleBySlug((await params).slug);
  return article ? articleMetadata(article) : {};
}

export default async function Page({ params }: Props) {
  const article = articleBySlug((await params).slug);
  if (!article) notFound();
  const lessons = article.series ? seriesLessons(article.series.id) : [];
  return <BlogArticle locale="en" article={article} lessons={lessons} />;
}
