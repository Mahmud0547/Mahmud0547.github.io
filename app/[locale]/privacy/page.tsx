import type { Metadata } from "next";
import { PrivacyPage } from "@/components/PrivacyPage";
import { getMessages, isLocale, type Locale } from "@/lib/i18n";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = getMessages(locale as Locale);
  return { title: `${t.privacy.title} | SimorghDev`, description: t.privacy.sections[0].text };
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;
  return <PrivacyPage locale={locale} />;
}
