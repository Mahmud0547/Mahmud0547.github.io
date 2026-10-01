import type { Metadata } from "next";
import { PrivacyPage } from "@/components/PrivacyPage";
import { getMessages } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

const t = getMessages("en");

export const metadata: Metadata = pageMetadata({ locale: "en", path: "/privacy/", title: `${t.privacy.title} | SimorghDev`, description: t.privacy.sections[0].text });

export default function Page() {
  return <PrivacyPage locale="en" />;
}
