import { getMessages, type Locale } from "@/lib/i18n";

export function HomePage({ locale }: { locale: Locale }) {
  const t = getMessages(locale);
  return (
    <main id="main">
      <h1>{t.hero.title}</h1>
    </main>
  );
}
