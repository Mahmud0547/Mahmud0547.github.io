import type { Locale } from "@/lib/i18n";
import { Header } from "./Header";
import { Hero } from "./Hero";
import { TrustStrip } from "./TrustStrip";
import { Services } from "./Services";
import { Work } from "./Work";

export function HomePage({ locale }: { locale: Locale }) {
  return (
    <>
      <Header locale={locale} path="/" />
      <main id="main">
        <Hero locale={locale} />
        <TrustStrip locale={locale} />
        <Work locale={locale} />
        <Services locale={locale} />
      </main>
    </>
  );
}
