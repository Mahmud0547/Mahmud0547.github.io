import type { Metadata } from "next";
import { PrivacyPage } from "@/components/PrivacyPage";
import { getMessages } from "@/lib/i18n";

const t = getMessages("en");

export const metadata: Metadata = { title: `${t.privacy.title} | SimorghDev`, description: t.privacy.sections[0].text };

export default function Page() {
  return <PrivacyPage locale="en" />;
}
