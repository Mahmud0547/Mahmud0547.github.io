import type { Locale } from "@/lib/i18n";
import { Footer } from "./Footer";
import { Header } from "./Header";

/** Header, main landmark and footer shared by every inner page. */
export function PageShell({ locale, path, children }: { locale: Locale; path: string; children: React.ReactNode }) {
  return (
    <>
      <Header locale={locale} path={path} />
      <main id="main">{children}</main>
      <Footer locale={locale} />
    </>
  );
}
