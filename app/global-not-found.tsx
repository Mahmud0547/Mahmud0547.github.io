import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import { RootShell } from "@/components/RootShell";
import { getMessages } from "@/lib/i18n";

const t = getMessages("en");

export const metadata: Metadata = { title: t.notFound.title };

export default function GlobalNotFound() {
  return (
    <RootShell locale="en">
      <main id="main" className="container-page py-32">
        <h1 className="text-4xl font-extrabold">{t.notFound.title}</h1>
        <Link href="/" className="mt-6 inline-block font-semibold text-lapis underline">
          {t.notFound.home}
        </Link>
      </main>
    </RootShell>
  );
}
