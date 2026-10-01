import type { Metadata } from "next";
import { HomePage } from "@/components/HomePage";
import { getMessages, isLocale, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = getMessages(locale as Locale);
  return pageMetadata({ locale: locale as Locale, path: "/", title: t.meta.title, description: t.meta.description });
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;
  return <HomePage locale={locale} />;
}
