import { getMessages, type Locale } from "@/lib/i18n";
import { Header } from "./Header";

export function HomePage({ locale }: { locale: Locale }) {
  const t = getMessages(locale);
  return (
    <>
      <Header locale={locale} path="/" />
      <main id="main">
        <h1>{t.hero.title}</h1>
      </main>
    </>
  );
}
