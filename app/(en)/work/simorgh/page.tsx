import type { Metadata } from "next";
import { CaseStudy } from "@/components/CaseStudy";
import { getMessages } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

const t = getMessages("en");

export const metadata: Metadata = pageMetadata({ locale: "en", path: "/work/simorgh/", title: `${t.case.title} | SimorghDev`, description: t.case.lead });

export default function Page() {
  return <CaseStudy locale="en" />;
}
