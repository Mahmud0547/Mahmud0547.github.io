import type { Metadata } from "next";
import { HomePage } from "@/components/HomePage";
import { getMessages } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

const t = getMessages("en");

export const metadata: Metadata = pageMetadata({ locale: "en", path: "/", title: t.meta.title, description: t.meta.description });

export default function Page() {
  return <HomePage locale="en" />;
}
