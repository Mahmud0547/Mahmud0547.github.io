import type { Metadata } from "next";
import { HomePage } from "@/components/HomePage";
import { getMessages } from "@/lib/i18n";

const t = getMessages("en");

export const metadata: Metadata = { title: t.meta.title, description: t.meta.description };

export default function Page() {
  return <HomePage locale="en" />;
}
