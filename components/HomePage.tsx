import type { Locale } from "@/lib/i18n";
import { personJsonLd } from "@/lib/seo";
import { About } from "./About";
import { Contact } from "./Contact";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { JsonLd } from "./JsonLd";
import { Hero } from "./Hero";
import { Process } from "./Process";
import { Services } from "./Services";
import { TrustStrip } from "./TrustStrip";
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
        <Process locale={locale} />
        <About locale={locale} />
        <Contact locale={locale} />
      </main>
      <Footer locale={locale} />
      <JsonLd data={personJsonLd(locale)} />
    </>
  );
}
