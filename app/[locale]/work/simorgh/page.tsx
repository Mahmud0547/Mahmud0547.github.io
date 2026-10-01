import type { Metadata } from "next";
import { CaseStudy } from "@/components/CaseStudy";
import { getMessages, isLocale, type Locale } from "@/lib/i18n";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = getMessages(locale as Locale);
  return { title: `${t.case.title} | SimorghDev`, description: t.case.lead };
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;
  return <CaseStudy locale={locale} />;
}
