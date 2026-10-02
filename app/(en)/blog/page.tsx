import type { Metadata } from "next";
import { BlogIndex } from "@/components/BlogPages";
import { allArticles } from "@/lib/blog";
import { getMessages } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

const t = getMessages("en").blog;

export const metadata: Metadata = pageMetadata({ locale: "en", path: "/blog/", title: `${t.title} | SimorghDev`, description: t.lead });

export default function Page() {
  return <BlogIndex locale="en" articles={allArticles()} />;
}
