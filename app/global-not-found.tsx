import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { RootShell } from "@/components/RootShell";
import { getMessages } from "@/lib/i18n";

const t = getMessages("en");

export const metadata: Metadata = { title: `${t.notFound.title} | SimorghDev` };

export default function GlobalNotFound() {
  return (
    <RootShell locale="en">
      <div className="dark-surface flex min-h-dvh flex-col bg-deep text-white">
        <header className="container-page flex h-[72px] items-center lg:h-[86px]">
          <Logo locale="en" />
        </header>
        <main id="main" className="container-page flex flex-1 flex-col items-start justify-center gap-5 pb-24">
          <p aria-hidden="true" className="text-[96px] font-extrabold leading-none tracking-[-0.04em] text-saffron lg:text-[160px]">
            404
          </p>
          <h1 className="text-[32px] font-extrabold tracking-[-0.03em] lg:text-5xl">{t.notFound.title}</h1>
          <Link href="/" className="mt-2 rounded-xl bg-saffron px-6 py-[15px] text-base font-semibold text-on-accent">
            {t.notFound.home}
          </Link>
        </main>
      </div>
    </RootShell>
  );
}
