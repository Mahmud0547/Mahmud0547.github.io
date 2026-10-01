import type { Metadata } from "next";
import { CaseStudy } from "@/components/CaseStudy";
import { getMessages } from "@/lib/i18n";

const t = getMessages("en");

export const metadata: Metadata = { title: `${t.case.title} | SimorghDev`, description: t.case.lead };

export default function Page() {
  return <CaseStudy locale="en" />;
}
